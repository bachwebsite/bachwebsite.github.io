function Stack(initSize) {
	let len = 0;
	const arr = [];
	this.ensureCapacity = size => {
		arr.length = Math.max(arr.length, size || 0);
	};
	this.push = function(ele) {
		this[len] = ele;
		len++;
	};
	this.pop = function() {
		if (len === 0) return;
		len--;
		const tmp = this[len];
		this[len] = undefined;
		return tmp;
	};
	this.isEmpty = () => {
		return len === 0;
	}
	this.ensureCapacity(initSize);
	Object.defineProperty(this, "length", {
		get: function() {
			return len;
		}
	});
}
export default Stack;
