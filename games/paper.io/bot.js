if (process.argv.length < 3) {
	console.log("Usage: node bot.js <socket-url> [<name>]")
	process.exit(1);
}

//TODO: add a land claiming algo (with coefficient parameters)
//TODO: add weight to the max land area and last land area, and also the number of kills
//TODO: genetic gene pooling

import { Grid } from "./src/core";

import client from "./src/game-client";
import { consts } from "./config.js";

const MOVES = [[-1, 0], [0, 1], [1, 0], [0, -1]];

const AGGRESSIVE = Math.random();
const THRESHOLD = 10;

let startFrame = -1;
let endFrame = -1;
const coeffs = [0.6164220147940495, -2.519369747858328, 0.9198978109542851, -1.2158956330674564, -3.072901620397528, 5, 4];
let grid;
let others;
let user;
const playerPortion = {};
const DIST_TYPES = {
	land: {
		check: function(loc) {
			return grid.get(loc.row, loc.col) === user;
		},
		coeff: function() {
			return coeffs[0];
		}
	}, tail: {
		check: function(loc) {
			return tail(user, loc)
		},
		coeff: function() {
			return coeffs[1];
		}
	}, oTail: {
		check: foundProto(tail),
		coeff: function() {
			return AGGRESSIVE * coeffs[2];
		}
	}, other: {
		check: foundProto(function(other, loc) {
			return other.row === this.row && other.col === this.col;
		}),
		coeff: function() {
			return (1 - AGGRESSIVE) * coeffs[3];
		}
	}, edge: {
		check: function(loc) {
			return loc.row <= 1 || loc.col <= 1 || loc.row >= consts.GRID_COUNT - 1 || loc.col >= consts.GRID_COUNT - 1
		},
		coeff: function() {
			return coeffs[4];
		}
	}
};

function generateLandDirections() {
	function mod(x) {
		x %= 4;
		if (x < 0) x += 4;
		return x;
	}

	const breadth = Math.floor(Math.random() * coeffs[5]) + 1;
	const spread = Math.floor(Math.random() * coeffs[6]) + 1;
	const extra = Math.floor(Math.random() * 2) + 1;
	const ccw = Math.floor(Math.random() * 2) * 2 - 1;

	const dir = user.currentHeading;
	const turns = [dir, mod(dir + ccw), mod(dir + ccw * 2), mod(dir + ccw * 3)];
	const lengths = [breadth, spread, breadth + extra, spread];

	const moves = [];
	for (let i = 0; i < turns.length; i++) {
		for (let j = 0; j < lengths[i]; j++) {
			moves.push(turns[i]);
		}
	}
}

const LAND_CLAIMS = {
	rectDims: function() {},
	rectSpread: function() {}
};

function foundProto(func) {
	return loc => {
		return others.some(other => {
			return func(other, loc);
		});
	};
}

function connect() {
	const prefixes = consts.PREFIXES.split(" ");
	const names = consts.NAMES.split(" ");
	const name = process.argv[3] || [prefixes[Math.floor(Math.random() * prefixes.length)], names[Math.floor(Math.random() * names.length)]].join(" ");
	client.connectGame(process.argv[2], "[BOT] " + name, (success, msg) => {
		if (!success) {
			console.error(msg);
			setTimeout(connect, 1000);
		}
	});
}

function Loc(row, col, step) {
	if (this.constructor != Loc) return new Loc(row, col, step);
	this.row = row;
	this.col = col;
	this.step = step;
}

//Projects vector b onto vector a
function project(a, b) {
	const factor = (b[0] * a[0] + b[1] * a[1]) / (a[0] * a[0] + a[1] * a[1]);
	return [factor * a[0], factor * a[1]];
}

function tail(player, loc) {
	return player.tail.hitsTail(loc);
}

function traverseGrid(dir) {
	steps = new Array(consts.GRID_COUNT * consts.GRID_COUNT);
	for (let i in steps) {
		steps[i] = -1;
	}

	distWeights = {};
	for (const type in DIST_TYPES) {
		distWeights[type] = 0;
	}

	const { row, col } = user;
	const minRow = Math.max(0, row - 10), maxRow = Math.min(consts.GRID_COUNT, row + 10);
	const minCol = Math.max(0, col - 10), maxCol = Math.min(consts.GRID_COUNT, col + 10);

	let proj = 0;
	for (let i = 1; i >= -1; i-=2) {
		proj = (1 + THRESHOLD) * i;
		while (proj != 0) {
			proj -= i;
			const normRange = Math.abs(proj);
			for (let norm = -normRange; norm <= normRange; norm++) {
				for (const distType in distWeights) {
					const move = MOVES[dir];
					const delta = THRESHOLD - Math.abs(proj);
					const dist = Math.sign(proj) * delta * delta / (Math.abs(norm) + 1);
					const loc = {row: proj * move[0] + norm * move[1], col: proj * move[1] + norm * move[0]};

					loc.row += user.row;
					loc.col += user.col;

					if (loc.row < 0 || loc.row >= consts.GRID_COUNT || loc.col < 0 || loc.col >= consts.GRID_COUNT) continue;
					if (DIST_TYPES[distType].check(loc)) distWeights[distType] += dist;
				}
			}
		}
	}
	return distWeights;
}

function printGrid() {
	const chars = new Grid(consts.GRID_COUNT);
	for (let r = 0; r < consts.GRID_COUNT; r++) {
		for (let c = 0; c < consts.GRID_COUNT; c++) {
			if (tail(user, {row: r, col: c})) chars.set(r, c, "t");
			else {
				const owner = grid.get(r, c);
				chars.set(r, c, owner ? "" + owner.num % 10 : ".");
			}
		}
	}

	for (const p of others) {
		chars.set(p.row, p.col, "x");
	}
	chars.set(user.row, user.col, "^>V<"[user.currentHeading]);

	let str = "";
	for (let r = 0; r < consts.GRID_COUNT; r++) {
		str += "\n";
		for (let c = 0; c < consts.GRID_COUNT; c++) {
			str += chars.get(r, c);
		}
	}
	console.log(str);
}

function update(frame) {
	if (startFrame == -1) startFrame = frame;
	endFrame = frame;
	if (frame % 6 == 1) {
		grid = client.grid;
		others = client.getOthers();
		//printGrid();
		const weights = [0, 0, 0, 0];
		for (let d of [3, 0, 1]) {
			let weight = 0;

			d = (d + user.currentHeading) % 4;
			distWeights = traverseGrid(d);

			let str = d + ": ";
			for (const distType in DIST_TYPES) {
				const point = distWeights[distType] * DIST_TYPES[distType].coeff();
				weight += point;
				str += distType + ": " + point + ", ";
			}
			//console.log(str);
			weights[d] = weight;
		}

		const low = Math.min(0, Math.min.apply(this, weights));
		let total = 0;

		weights[(user.currentHeading + 2) % 4] = low;
		for (let i = 0; i < weights.length; i++) {
			weights[i] -= low * (1 + Math.random());
			total += weights[i];
		}

		if (total == 0) {
			for (let d of [-1, 0, 1]) {
				d = (d + user.currentHeading) % 4;
				while (d < 0) d += 4;
				weights[d] = 1;
				total++;
			}
		}
		//console.log(weights)
		//Choose a random direction from the weighted list
		let choice = Math.random() * total;
		let d = 0;
		while (choice > weights[d]) {
			choice -= weights[d++];
		}
		client.changeHeading(d);
	}
}

function calcFavorability(params) {
	return params.portion + params.kills * 50 + params.survival / 100;
}

client.setAllowAnimation(false);
client.setRenderer({
	addPlayer: function(player) {
		playerPortion[player.num] = 0;
	},
	disconnect: function() {
		const dt = (endFrame - startFrame);
		startFrame = -1;
		console.log(`[${new Date()}] I died... (survived for ${dt} frames.)`);
		console.log(`[${new Date()}] I killed ${client.getKills()} player(s).`);
		console.log("Coefficients: " + coeffs);

		const mutation = Math.min(10, Math.pow(2, calcFavorability(params)));
		for (let i = 0; i < coeffs.length; i++) {
			coeffs[i] += Math.random() * mutation * 2 - mutation;
		}
		connect();
	},
	removePlayer: function(player) {
		delete playerPortion[player.num];
	},
	setUser: function(u) {
		user = u;
	},
	update: update,
	updateGrid: function(row, col, before, after) {
		before && playerPortion[before.num]--;
		after && playerPortion[after.num]++;
	}
});

connect();
