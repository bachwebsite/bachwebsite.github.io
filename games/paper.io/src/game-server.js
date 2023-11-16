import { Color, Grid, Player, initPlayer, updateFrame } from "./core/index.js";
import { consts } from "../config.js";

function Game(id) {
	const possColors = Color.possColors();
	let nextInd = 0;
	const players = [];
	const gods = [];
	let newPlayers = [];
	const frameLocs = [];
	let frame = 0;
	let filled = 0;
	const grid = new Grid(consts.GRID_COUNT, (row, col, before, after) => {
		if (!!after ^ !!before) {
			if (after) filled++;
			else filled--;
			if (filled === consts.GRID_COUNT * consts.GRID_COUNT) console.log(`[${new Date()}] FULL GAME`);
		}
	});
	this.id = id;
	this.addPlayer = (client, name) => {
		if (players.length >= consts.MAX_PLAYERS) return false;
		const start = findEmpty(grid);
		if (!start) return false;
		const params = {
			posX: start.col * consts.CELL_WIDTH,
			posY: start.row * consts.CELL_WIDTH,
			currentHeading: Math.floor(Math.random() * 4),
			name,
			num: nextInd,
			base: possColors.shift()
		};
		const p = new Player(grid, params);
		p.tmpHeading = params.currentHeading;
		p.client = client;
		players.push(p);
		newPlayers.push(p);
		nextInd++;
		initPlayer(grid, p);
		if (p.name.indexOf("[BOT]") == -1) console.log(`[${new Date()}] ${p.name || "Unnamed"} (${p.num}) joined.`);
		client.on("requestFrame", () => {
			if (p.frame === frame) return;
			p.frame = frame; //Limit number of requests per frame (One per frame)
			const splayers = players.map(val => val.serialData());
			client.emit("game", {
				"num": p.num,
				"gameid": id,
				"frame": frame,
				"players": splayers,
				"grid": gridSerialData(grid, players)
			});
		});
		client.on("frame", (data, errorHan) => {
			if (typeof data === "function") {
				errorHan(false, "No data supplied.");
				return;
			}
			if (typeof errorHan !== "function") errorHan = () => {};
			if (!data) errorHan(false, "No data supplied.");
			else if (!checkInt(data.frame, 0, Infinity)) errorHan(false, "Requires a valid non-negative frame integer.");
			else if (data.frame > frame) errorHan(false, "Invalid frame received.");
			else {
				if (data.heading !== undefined) {
					if (checkInt(data.heading, 0, 4)) {
						p.tmpHeading = data.heading;
						errorHan(true);
					}
					else errorHan(false, "New heading must be an integer of range [0, 4).");
				}
			}
		});
		client.on("disconnect", () => {
			p.die(); //Die immediately if not already
			p.disconnected = true;
			if (p.name.indexOf("[BOT]") == -1) console.log(`[${new Date()}] ${p.name || "Unnamed"} (${p.num}) left.`);
		});
		return true;
	};
	this.addGod = client => {
		const g = {
			client,
			frame
		};
		gods.push(g);
		const splayers = players.map(val => val.serialData());
		client.emit("game", {
			"gameid": id,
			"frame": frame,
			"players": splayers,
			"grid": gridSerialData(grid, players)
		});
		client.on("requestFrame", () => {
			if (g.frame === frame) return;
			g.frame = frame; //Limit number of requests per frame (One per frame)
			const splayers = players.map(val => val.serialData());
			g.client.emit("game", {
				"gameid": id,
				"frame": frame,
				"players": splayers,
				"grid": gridSerialData(grid, players)
			});
		});
		return true;
	};

	function pushPlayerLocations() {
		const locs = [];
		for (const p of players) {
			locs[p.num] = [p.posX, p.posY, p.waitLag];
		}
		locs.frame = frame;
		if (frameLocs.length >= 300) frameLocs.shift(); //Give it 5 seconds of lag
		frameLocs.push(locs);
	}

	function verifyPlayerLocations(fr, verify, resp) {
		const minFrame = frame - frameLocs.length + 1;
		if (fr < minFrame || fr > frame) {
			resp(false, false, "Frames out of reference");
			return;
		}

		function string(loc) {
			return `(${loc[0]}, ${loc[1]}) [${loc[2]}]`;
		}
		const locs = frameLocs[fr - minFrame];
		if (locs.frame !== fr) {
			resp(false, false, locs.frame + " != " + fr);
			return;
		}
		for (const num in verify) {
			if (!locs[num]) continue;
			if (locs[num][0] !== verify[num][0] || locs[num][1] !== verify[num][1] || locs[num][2] !== verify[num][2]) {
				resp(false, true, "P" + num + " " + string(locs[num]) + " !== " + string(verify[num]));
				return;
			}
		}
		resp(true, false);
	}

	function tick() {
		//TODO: notify those players that this server automatically drops out
		const splayers = players.map(val => val.serialData());
		const snews = newPlayers.map(val => {
			//Emit game stats.
			val.client.emit("game", {
				"num": val.num,
				"gameid": id,
				"frame": frame,
				"players": splayers,
				"grid": gridSerialData(grid, players),
			});
			return val.serialData();
		});
		const moves = players.map(val => {
			//Account for race condition (when heading is set after emitting frames, and before updating)
			val.heading = val.tmpHeading;
			return {
				num: val.num,
				left: !!val.disconnected,
				heading: val.heading
			};
		});
		update();
		const data = {
			frame: frame + 1,
			moves
		};
		if (snews.length > 0) {
			data.newPlayers = snews;
			newPlayers = [];
		}
		for (const p of players) {
			p.client.emit("notifyFrame", data);
		}
		for (const g of gods) {
			g.client.emit("notifyFrame", data);
		}
		frame++;
		pushPlayerLocations();
	}
	this.tickFrame = tick;

	function update() {
		const dead = [];
		updateFrame(grid, players, dead);
		for (const p of dead) {
			if (!p.handledDead) {
				possColors.push(p.baseColor);
				p.handledDead = true;
			}
			if (p.name.indexOf("[BOT]") == -1) console.log(`${p.name || "Unnamed"} (${p.num}) died.`);
			p.client.emit("dead");
			p.client.disconnect(true);
		}
	}
}

function checkInt(value, min, max) {
	return !(typeof value !== "number" || value < min || value >= max || Math.floor(value) !== value);
}

function gridSerialData(grid, players) {
	const buff = Buffer.alloc(grid.size * grid.size);
	const numToIndex = new Array(players.length > 0 ? players[players.length - 1].num + 1 : 0);
	for (let i = 0; i < players.length; i++) {
		numToIndex[players[i].num] = i + 1;
	}
	for (let r = 0; r < grid.size; r++) {
		for (let c = 0; c < grid.size; c++) {
			const ele = grid.get(r, c);
			buff[r * grid.size + c] = ele ? numToIndex[ele.num] : 0;
		}
	}
	return buff;
}

function findEmpty(grid) {
	const available = [];
	for (let r = 1; r < grid.size - 1; r++) {
		for (let c = 1; c < grid.size - 1; c++) {
			let cluttered = false;
			checkclutter: for (let dr = -1; dr <= 1; dr++) {
				for (let dc = -1; dc <= 1; dc++) {
					if (grid.get(r + dr, c + dc)) {
						cluttered = true;
						break checkclutter;
					}
				}
			}
			if (!cluttered) available.push({
				row: r,
				col: c
			});
		}
	}
	return (available.length === 0) ? null : available[Math.floor(available.length * Math.random())];
}
export default Game;
