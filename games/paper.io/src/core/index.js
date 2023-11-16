import { consts } from "../../config.js";
export { default as Color } from "./color.js";
export { default as Grid } from "./grid.js";
export { default as Player } from "./player.js";

export function initPlayer(grid, player) {
	for (let dr = -1; dr <= 1; dr++) {
		for (let dc = -1; dc <= 1; dc++) {
			if (!grid.isOutOfBounds(dr + player.row, dc + player.col)) grid.set(dr + player.row, dc + player.col, player);
		}
	}
}

export function updateFrame(grid, players, dead, notifyKill) {
	let adead = [];
	if (dead instanceof Array) adead = dead;

	//Move players
	let tmp = players.filter(val => {
		val.move();
		if (val.dead) adead.push(val);
		return !val.dead;
	});

	//Remove players with collisions
	const removing = new Array(players.length);

	const kill = (!notifyKill) ? () => { } : (killer, other) => {
		if (!removing[other]) notifyKill(killer, other);
	};
	for (let i = 0; i < players.length; i++) {
		for (let j = i; j < players.length; j++) {

			//Remove those players when other players have hit their tail
			if (!removing[j] && players[j].tail.hitsTail(players[i])) {
				kill(i, j);
				removing[j] = true;
				//console.log("TAIL");
			}
			if (!removing[i] && players[i].tail.hitsTail(players[j])) {
				kill(j, i);
				removing[i] = true;
				//console.log("TAIL");
			}

			//Remove players with collisons...
			if (i !== j && squaresIntersect(players[i].posX, players[j].posX) &&
				squaresIntersect(players[i].posY, players[j].posY)) {
				//...if one player is own his own territory, the other is out
				if (grid.get(players[i].row, players[i].col) === players[i]) {
					kill(i, j);
					removing[j] = true;
				}
				else if (grid.get(players[j].row, players[j].col) === players[j]) {
					kill(j, i);
					removing[i] = true;
				}
				else {
					//...otherwise, the one that sustains most of the collision will be removed
					const areaI = area(players[i]);
					const areaJ = area(players[j]);

					if (areaI === areaJ) {
						kill(i, j);
						kill(j, i);
						removing[i] = removing[j] = true;
					}
					else if (areaI > areaJ) {
						kill(j, i);
						removing[i] = true;
					}
					else {
						kill(i, j);
						removing[j] = true;
					}
				}
			}
		}
	}

	tmp = tmp.filter((val, i) => {
		if (removing[i]) {
			adead.push(val);
			val.die();
		}
		return !removing[i];
	});
	players.length = tmp.length;
	for (let i = 0; i < tmp.length; i++) {
		players[i] = tmp[i];
	}

	//Remove dead squares
	for (let r = 0; r < grid.size; r++) {
		for (let c = 0; c < grid.size; c++) {
			if (adead.indexOf(grid.get(r, c)) !== -1) grid.set(r, c, null);
		}
	}
}

function squaresIntersect(a, b) {
	return (a < b) ? (b < a + consts.CELL_WIDTH) : (a < b + consts.CELL_WIDTH);
}

function area(player) {
	const xDest = player.col * consts.CELL_WIDTH;
	const yDest = player.row * consts.CELL_WIDTH;
	return (player.posX === xDest) ? Math.abs(player.posY - yDest) : Math.abs(player.posX - xDest);
}
