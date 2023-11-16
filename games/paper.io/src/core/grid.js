function Grid(size, changeCallback) {
	let grid = new Array(size);
	let modified = false;
	const data = {
		grid,
		size
	};

	this.get = (row, col) => {
		if (isOutOfBounds(data, row, col)) throw new RangeError("Row or Column value out of bounds");
		return grid[row] && grid[row][col];
	}
	this.set = (row, col, value) => {
		if (isOutOfBounds(data, row, col)) throw new RangeError("Row or Column value out of bounds");
		if (!grid[row]) grid[row] = new Array(size);
		const before = grid[row][col];
		grid[row][col] = value;
		if (typeof changeCallback === "function") changeCallback(row, col, before, value);
		modified = true;
		return before;
	}
	this.reset = () => {
		if (modified) {
			grid = new Array(size);
			modified = false;
		}
	}
	this.isOutOfBounds = isOutOfBounds.bind(this, data);

	Object.defineProperty(this, "size", {
		get: function() {
			return size;
		},
		enumerable: true
	});
}

function isOutOfBounds(data, row, col) {
	return row < 0 || row >= data.size || col < 0 || col >= data.size;
}

export default Grid;
