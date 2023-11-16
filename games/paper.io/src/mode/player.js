import jquery from "jquery";

import { Color, Grid } from "../core";
import * as client from "../game-client";
import { consts } from "../../config.js";

const SHADOW_OFFSET = 5;
const ANIMATE_FRAMES = 24;
const BOUNCE_FRAMES = [8, 4];
const DROP_HEIGHT = 24;
const DROP_SPEED = 2;
const MIN_BAR_WIDTH = 65;
const BAR_HEIGHT = SHADOW_OFFSET + consts.CELL_WIDTH;
const BAR_WIDTH = 400;

let canvas, ctx, offscreenCanvas, offctx, canvasWidth, canvasHeight, gameWidth, gameHeight;
const $ = jquery;

$(() => {
	canvas = $("#main-ui")[0];
	ctx = canvas.getContext("2d");
	offscreenCanvas = document.createElement("canvas");
	offctx = offscreenCanvas.getContext("2d");
	updateSize();
});

let animateGrid, playerPortion, portionsRolling, barProportionRolling, animateTo, offset, user, zoom, showedDead;
const grid = client.grid;

function updateSize() {
	let changed = false;
	if (canvasWidth != window.innerWidth) {
		gameWidth = canvasWidth = offscreenCanvas.width = canvas.width = window.innerWidth;
		changed = true;
	}
	if (canvasHeight != window.innerHeight) {
		canvasHeight = offscreenCanvas.height = canvas.height = window.innerHeight;
		gameHeight = canvasHeight - BAR_HEIGHT;
		changed = true;
	}
	if (changed && user) centerOnPlayer(user, offset);
}

function reset() {
	animateGrid = new Grid(consts.GRID_COUNT);
	playerPortion = [];
	portionsRolling = [];
	barProportionRolling = [];
	animateTo = [0, 0];
	offset = [0, 0];
	user = null;
	zoom = 1;
	showedDead = false;
}

reset();

//Paint methods
function paintGridBorder(ctx) {
	ctx.fillStyle = "lightgray";
	const gridWidth = consts.CELL_WIDTH * consts.GRID_COUNT;

	ctx.fillRect(-consts.BORDER_WIDTH, 0, consts.BORDER_WIDTH, gridWidth);
	ctx.fillRect(-consts.BORDER_WIDTH, -consts.BORDER_WIDTH, gridWidth + consts.BORDER_WIDTH * 2, consts.BORDER_WIDTH);
	ctx.fillRect(gridWidth, 0, consts.BORDER_WIDTH, gridWidth);
	ctx.fillRect(-consts.BORDER_WIDTH, gridWidth, gridWidth + consts.BORDER_WIDTH * 2, consts.BORDER_WIDTH);
}

function paintGrid(ctx) {
	//Paint background
	ctx.fillStyle = "rgb(211, 225, 237)";
	ctx.fillRect(0, 0, consts.CELL_WIDTH * consts.GRID_COUNT, consts.CELL_WIDTH * consts.GRID_COUNT);
	paintGridBorder(ctx);

	//Get viewing limits
	const offsetX = (offset[0] - consts.BORDER_WIDTH);
	const offsetY = (offset[1] - consts.BORDER_WIDTH);
	const minRow = Math.max(Math.floor(offsetY / consts.CELL_WIDTH), 0);
	const minCol = Math.max(Math.floor(offsetX / consts.CELL_WIDTH), 0);
	const maxRow = Math.min(Math.ceil((offsetY + gameHeight / zoom) / consts.CELL_WIDTH), grid.size);
	const maxCol = Math.min(Math.ceil((offsetX + gameWidth / zoom) / consts.CELL_WIDTH), grid.size);
	let x, y, animateSpec, baseColor, shadowColor;

	//Paint occupied areas (and fading ones)
	for (let r = minRow; r < maxRow; r++) {
		for (let c = minCol; c < maxCol; c++) {
			const p = grid.get(r, c);
			x = c * consts.CELL_WIDTH;
			y = r * consts.CELL_WIDTH;
			animateSpec = animateGrid.get(r, c);
			if (client.allowAnimation && animateSpec) {
				if (animateSpec.before) { //fading animation
					const frac = (animateSpec.frame / ANIMATE_FRAMES);
					const back = new Color(.58, .41, .92, 1);
					baseColor = animateSpec.before.lightBaseColor.interpolateToString(back, frac);
					shadowColor = animateSpec.before.shadowColor.interpolateToString(back, frac);
				}
				else continue;
			}
			else if (p) {
				baseColor = p.lightBaseColor;
				shadowColor = p.shadowColor;
			}
			else continue; //No animation nor is this player owned
			const hasBottom = !grid.isOutOfBounds(r + 1, c);
			const bottomAnimate = hasBottom && animateGrid.get(r + 1, c);
			const totalStatic = !bottomAnimate && !animateSpec;
			const bottomEmpty = totalStatic ? (hasBottom && !grid.get(r + 1, c)) : (!bottomAnimate || (bottomAnimate.after && bottomAnimate.before));
			if (hasBottom && ((!!bottomAnimate ^ !!animateSpec) || bottomEmpty)) {
				ctx.fillStyle = shadowColor.rgbString();
				ctx.fillRect(x, y + consts.CELL_WIDTH, consts.CELL_WIDTH + 1, SHADOW_OFFSET);
			}
			ctx.fillStyle = baseColor.rgbString();
			ctx.fillRect(x, y, consts.CELL_WIDTH + 1, consts.CELL_WIDTH + 1);
		}
	}
	if (!client.allowAnimation) return;

	//Paint squares with drop in animation
	for (let r = 0; r < grid.size; r++) {
		for (let c = 0; c < grid.size; c++) {
			animateSpec = animateGrid.get(r, c);
			x = c * consts.CELL_WIDTH, y = r * consts.CELL_WIDTH;
			if (animateSpec && client.allowAnimation) {
				const viewable = r >= minRow && r < maxRow && c >= minCol && c < maxCol;
				if (animateSpec.after && viewable) {
					//Bouncing the squares.
					const offsetBounce = getBounceOffset(animateSpec.frame);
					y -= offsetBounce;
					shadowColor = animateSpec.after.shadowColor;
					baseColor = animateSpec.after.lightBaseColor.deriveLumination(-(offsetBounce / DROP_HEIGHT) * .1);
					ctx.fillStyle = shadowColor.rgbString();
					ctx.fillRect(x, y + consts.CELL_WIDTH, consts.CELL_WIDTH, SHADOW_OFFSET);
					ctx.fillStyle = baseColor.rgbString();
					ctx.fillRect(x, y, consts.CELL_WIDTH + 1, consts.CELL_WIDTH + 1);
				}
				animateSpec.frame++;
				if (animateSpec.frame >= ANIMATE_FRAMES) animateGrid.set(r, c, null);
			}
		}
	}
}

function paintUIBar(ctx) {
	//UI Bar background
	ctx.fillStyle = "#24422c";
	ctx.fillRect(0, 0, canvasWidth, BAR_HEIGHT);

	let barOffset;
	ctx.fillStyle = "white";
	ctx.font = "24px Changa";
	barOffset = (user && user.name) ? (ctx.measureText(user.name).width + 20) : 0;
	ctx.fillText(user ? user.name : "", 5, consts.CELL_WIDTH - 5);

	//Draw filled bar
	ctx.fillStyle = "rgba(180, 180, 180, .3)";
	ctx.fillRect(barOffset, 0, BAR_WIDTH, BAR_HEIGHT);

	const userPortions = portionsRolling[user.num] ? portionsRolling[user.num].lag : 0;
	let barSize = Math.ceil((BAR_WIDTH - MIN_BAR_WIDTH) * userPortions + MIN_BAR_WIDTH);
	ctx.fillStyle = user ? user.baseColor.rgbString() : "";
	ctx.fillRect(barOffset, 0, barSize, consts.CELL_WIDTH);
	ctx.fillStyle = user ? user.shadowColor.rgbString() : "";
	ctx.fillRect(barOffset, consts.CELL_WIDTH, barSize, SHADOW_OFFSET);

	//TODO: dont reset kill count and zoom when we request frames.
	//Percentage
	ctx.fillStyle = "white";
	ctx.font = "18px Changa";
	ctx.fillText((userPortions * 100).toFixed(3) + "%", 5 + barOffset, consts.CELL_WIDTH - 5);

	//Number of kills
	const killsText = "Kills: " + client.getKills();
	const killsOffset = 20 + BAR_WIDTH + barOffset;
	ctx.fillText(killsText, killsOffset, consts.CELL_WIDTH - 5);

	//Calcuate rank
	const sorted = [];
	client.getPlayers().forEach(val => {
		sorted.push({player: val, portion: playerPortion[val.num]});
	});
	sorted.sort((a, b) => {
		return (a.portion === b.portion) ? a.player.num - b.player.num : b.portion - a.portion;
	});

	const rank = sorted.findIndex(val => val.player === user);
	ctx.fillText("Rank: " + (rank === -1 ? "--" : rank + 1) + " of " + sorted.length,
	ctx.measureText(killsText).width + killsOffset + 20, consts.CELL_WIDTH - 5);

	//Rolling the leaderboard bars
	if (sorted.length > 0) {
		const maxPortion = sorted[0].portion;
		client.getPlayers().forEach(player => {
			const rolling = barProportionRolling[player.num];
			rolling.value = playerPortion[player.num] / maxPortion;
			rolling.update();
		});
	}

	//Show leaderboard
	const leaderboardNum = Math.min(consts.LEADERBOARD_NUM, sorted.length);
	for (let i = 0; i < leaderboardNum; i++) {
		const { player } = sorted[i];
		const name = player.name || "Unnamed";
		const portion = barProportionRolling[player.num].lag;
		const nameWidth = ctx.measureText(name).width;
		barSize = Math.ceil((BAR_WIDTH - MIN_BAR_WIDTH) * portion + MIN_BAR_WIDTH);
		const barX = canvasWidth - barSize;
		const barY = BAR_HEIGHT * (i + 1);
		const offset = i == 0 ? 10 : 0;
		ctx.fillStyle = "rgba(10, 10, 10, .3)";
		ctx.fillRect(barX - 10, barY + 10 - offset, barSize + 10, BAR_HEIGHT + offset);
		ctx.fillStyle = player.baseColor.rgbString();
		ctx.fillRect(barX, barY, barSize, consts.CELL_WIDTH);
		ctx.fillStyle = player.shadowColor.rgbString();
		ctx.fillRect(barX, barY + consts.CELL_WIDTH, barSize, SHADOW_OFFSET);
		ctx.fillStyle = "black";
		ctx.fillText(name, barX - nameWidth - 15, barY + 27);
		const percentage = (portionsRolling[player.num].lag * 100).toFixed(3) + "%";
		ctx.fillStyle = "white";
		ctx.fillText(percentage, barX + 5, barY + consts.CELL_WIDTH - 5);
	}
}

function paint(ctx) {
	ctx.fillStyle = "#e2ebf3"; //"whitesmoke";
	ctx.fillRect(0, 0, canvasWidth, canvasHeight);

	//Move grid to viewport as said with the offsets, below the stats
	ctx.save();
	ctx.translate(0, BAR_HEIGHT);
	ctx.beginPath();
	ctx.rect(0, 0, gameWidth, gameHeight);
	ctx.clip();

	//Zoom in/out based on player stats
	ctx.scale(zoom, zoom);
	ctx.translate(-offset[0] + consts.BORDER_WIDTH, -offset[1] + consts.BORDER_WIDTH);

	paintGrid(ctx);
	client.getPlayers().forEach(p => {
		const fr = p.waitLag;
		if (fr < ANIMATE_FRAMES) p.render(ctx, fr / ANIMATE_FRAMES);
		else p.render(ctx);
	});

	//Reset transform to paint fixed UI elements
	ctx.restore();
	paintUIBar(ctx);

	if ((!user || user.dead) && !showedDead) {
		showedDead = true;
		console.log("You died!");
	}
}

function paintDoubleBuff() {
	paint(offctx);
	ctx.drawImage(offscreenCanvas, 0, 0);
}

function update() {
	updateSize();

	//Change grid offsets
	for (let i = 0; i <= 1; i++) {
		if (animateTo[i] !== offset[i]) {
			if (client.allowAnimation) {
				const delta = animateTo[i] - offset[i];
				const dir = Math.sign(delta);
				const mag = Math.min(consts.SPEED, Math.abs(delta));
				offset[i] += dir * mag;
			}
			else offset[i] = animateTo[i];
		}
	}

	//Calculate player portions
	client.getPlayers().forEach(player => {
		const roll = portionsRolling[player.num];
		roll.value = playerPortion[player.num] / consts.GRID_COUNT / consts.GRID_COUNT;
		roll.update();
	});

	//Zoom goes from 1 to .5, decreasing as portion goes up. TODO: maybe can modify this?
	if (portionsRolling[user.num]) zoom = 1 / (portionsRolling[user.num].lag + 1);
	//TODO: animate player is dead. (maybe explosion?), and tail rewinds itself.
	if (user) centerOnPlayer(user, animateTo);
}

//Helper methods
function centerOnPlayer(player, pos) {
	const xOff = Math.floor(player.posX - (gameWidth / zoom - consts.CELL_WIDTH) / 2);
	const yOff = Math.floor(player.posY - (gameHeight / zoom - consts.CELL_WIDTH) / 2);
	const gridWidth = grid.size * consts.CELL_WIDTH + consts.BORDER_WIDTH * 2;
	pos[0] = xOff; //Math.max(Math.min(xOff, gridWidth + (BAR_WIDTH + 100) / zoom - gameWidth / zoom), 0);
	pos[1] = yOff; //Math.max(Math.min(yOff, gridWidth - gameHeight / zoom), 0);
}

function getBounceOffset(frame) {
	let offsetBounce = ANIMATE_FRAMES;
	let bounceNum = BOUNCE_FRAMES.length - 1;
	while (bounceNum >= 0 && frame < offsetBounce - BOUNCE_FRAMES[bounceNum]) {
		offsetBounce -= BOUNCE_FRAMES[bounceNum];
		bounceNum--;
	}
	if (bounceNum === -1) return (offsetBounce - frame) * DROP_SPEED;
	else {
		offsetBounce -= BOUNCE_FRAMES[bounceNum];
		frame = frame - offsetBounce;
		const midFrame = BOUNCE_FRAMES[bounceNum] / 2;
		return (frame >= midFrame) ? (BOUNCE_FRAMES[bounceNum] - frame) * DROP_SPEED : frame * DROP_SPEED;
	}
}

function Rolling(value, frames) {
	let lag = 0;
	if (!frames) frames = 24;
	this.value = value;
	Object.defineProperty(this, "lag", {
		get: function() {
			return lag;
		},
		enumerable: true
	});
	this.update = function() {
		const delta = this.value - lag;
		const dir = Math.sign(delta);
		const speed = Math.abs(delta) / frames;
		const mag = Math.min(Math.abs(speed), Math.abs(delta));

		lag += mag * dir;
		return lag;
	}
}

export function addPlayer(player) {
	playerPortion[player.num] = 0;
	portionsRolling[player.num] = new Rolling(9 / consts.GRID_COUNT / consts.GRID_COUNT, ANIMATE_FRAMES);
	barProportionRolling[player.num] = new Rolling(0, ANIMATE_FRAMES);
};

export function disconnect() {
	$("#wasted").fadeIn(1000);
};

export function removePlayer(player) {
	delete playerPortion[player.num];
	delete portionsRolling[player.num];
	delete barProportionRolling[player.num];
};

export function setUser(player) {
	user = player;
	centerOnPlayer(user, offset);
};

export { reset };

export function updateGrid (row, col, before, after) {
	//Keep track of areas
	if (before) playerPortion[before.num]--;
	if (after) playerPortion[after.num]++;
	//Queue animation
	if (before === after || !client.allowAnimation) return;
	animateGrid.set(row, col, {
		before: before,
		after: after,
		frame: 0
	});
};

export { paintDoubleBuff as paint };

export { update };
