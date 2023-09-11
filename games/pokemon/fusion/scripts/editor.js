
class Layer {
	constructor(order, parentCanvas) {
		this.order = order;
		this.width = parentCanvas.width;
		this.height = parentCanvas.height;
		this.layer = document.createElement("canvas");
		this.layer.width = this.width;
		this.layer.height = this.height;
		this.images = [];
		this.imageBuffer = null;
	}
	
	draw(canvas) {
		var ctx = canvas.getContext("2d");
		for (var i = 0; i < this.images.length; i++) {
			ctx.drawImage(this.images[i].image, this.images[i].x, this.images[i].y);
		}
	}
	
	addImage(image, x, y) {
		this.images.push({"image" : image, "x" : x, "y" : y, 
			"width" : image.width, "height" : image.height});
	}
	
	getLastImage() {
		return this.images[this.images.length - 1];
	}
	
	moveImage(positionedImage, position) {
		positionedImage.x = position.x;
		positionedImage.y = position.y;
	}
}

var elements = {
	"mainCanvas" : getElement("#mainCanvas"),
	"layerCanvas" : getElement("#layerCanvas"),
	"clearButton" : getElement("#clearButton"),
	"browseButton" : getElement("#browseButton"),
	"prevLayer" : getElement("#prevLayer"),
	"nextLayer" : getElement("#nextLayer"),
	"addLayer" : getElement("#addLayer"),
	"deleteLayer" : getElement("#deleteLayer"),
	"currentLayer" : getElement("#currentLayer"),
	"moveImage" : getElement("#moveImage"),
	"isoLayer" : getElement("#isoLayer")
}

var parameters = {
	"currentLayer" : 0,
	"moveImage" : true,
	"events" : null
}

var assets = {
	"mainCanvas" : elements.mainCanvas,
	"latestImage" : null,
	"selectedImage" : null,
	"canvasSnapshot" : null,
	"blankCanvas" : null,
	"layers" : []
}

function getElement(name) {
	return document.querySelector(name);
}

function createEvents() {
	var events = {};
	var eventTypes = ["mousedown", "mouseup", "mousemove"];
	
	for (var i = 0; i < eventTypes.length; i++) {
		events[eventTypes[i]] = false;
	}
	
	return events;
}

function getMousePosition(event, element) {
	return {"x" : event.clientX - element.offsetLeft,
		"y" : event.clientY - element.offsetTop};
}

function getCurrentLayer() {
	return assets.layers[parameters.currentLayer];
}

function centreMousePosition(mousePos, image) {
	mousePos.x -= (image.width / 2);
	mousePos.y -= (image.height / 2);
}

function snapshotCanvas(canvas) {
	assets.canvasSnapshot = canvas.getContext("2d").getImageData(0, 0, canvas.width, 
		canvas.height);
}

function restoreCanvas(canvas) {
	canvas.getContext("2d").putImageData(assets.canvasSnapshot, 0, 0);
}

function drawScaledImage(canvas, imageData, scale, position) {
	var ctx = canvas.getContext("2d");
	ctx.scale(scale.x, scale.y);
	ctx.drawImage(imageData, position.x, position.y);
	ctx.scale(1/scale.x, 1/scale.y);
}

function drawText(canvas, text, x, y) {
		var ctx = canvas.getContext("2d");
		ctx.font = "20px Arial";
		ctx.fillStyle = "black";
		ctx.textAlign = "center";
		ctx.fillText(text, x, y);
}

function drawFromLayers() {
	var canvas = elements.mainCanvas;
	canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
	for (var i = 0; i < assets.layers.length; i++) {
		assets.layers[i].draw(elements.mainCanvas);
	}
}

function getLayerImageData(layerNumber) {
	var layer = assets.layers[layerNumber];
	var canvas = elements.mainCanvas;
	var ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	layer.draw(canvas);
	var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	drawFromLayers();
	
	return imageData;
}

function drawImageBuffer(mousePos) {
	var currentLayer = getCurrentLayer();
	var buffer = currentLayer.imageBuffer;
	centreMousePosition(mousePos, buffer.image);
	currentLayer.moveImage(buffer, mousePos);
	drawFromLayers();
}

function getImageAtPosition(x, y) {
	var currentLayer = getCurrentLayer();
	for (var i = 0; i < currentLayer.images.length; i++) {
		var image = currentLayer.images[i];
		var rect = {"x" : image.x, "y" : image.y, 
			"width" : image.width, "height" : image.height};
		
		if (pointInRect(x, y, rect)) {
			return image;
		}
	}
}

function pointInRect(x, y, rect) {
	if (x >= rect.x && x <= (rect.x + rect.width) &&
		y >= rect.y && y <= (rect.y + rect.height)) return true;
		
	return false;
}

function setUpElements() {
	window.onload = () => {
		snapshotCanvas(elements.mainCanvas);
		assets.blankCanvas = assets.canvasSnapshot;
		assets.layers.push(new Layer(0, assets.blankCanvas, elements.mainCanvas));
		parameters.events = createEvents();
	}
	
	elements.clearButton.onclick = () => {
		var canvas = elements.mainCanvas;
		canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
		assets.layers = [new Layer(0, elements.mainCanvas)];
		parameters.currentLayer = 0;
		snapshotCanvas(canvas);
	}
	
	elements.browseButton.addEventListener("change", e => {
		var reader = new FileReader();
		reader.onload = e => {
			var image = new Image();
			image.src = e.target.result;
			image.onload = () => {
				var currentLayer = getCurrentLayer()
				currentLayer.addImage(image, 0, 0);
				currentLayer.imageBuffer = currentLayer.getLastImage();
			}
		};
		reader.readAsDataURL(e.target.files[0]);
	});
		
	elements.mainCanvas.addEventListener("mousedown", e => {
		parameters.events["mousedown"] = true;
		parameters.events["mouseup"] = false;
		var mousePos = getMousePosition(e, elements.mainCanvas);
		
		if (parameters.moveImage) {
			getCurrentLayer().imageBuffer = getImageAtPosition(mousePos.x, mousePos.y);
		}
	});	
	
	elements.mainCanvas.addEventListener("mouseup", e => {
		parameters.events["mousedown"] = false;
		parameters.events["mouseup"] = true;
	});	
	
	elements.mainCanvas.onclick = e => {
		var currentLayer = getCurrentLayer();
		if (currentLayer.imageBuffer == null) return;
		var mousePos = getMousePosition(e, elements.mainCanvas);
		console.log(mousePos);
		drawImageBuffer(mousePos);
		snapshotCanvas(elements.mainCanvas);
		currentLayer.imageBuffer = null;
	};
	
	elements.mainCanvas.addEventListener("mousemove", e => {
		if (getCurrentLayer().imageBuffer != null) {
			restoreCanvas(elements.mainCanvas);
			var mousePos = getMousePosition(e, elements.mainCanvas);
			drawImageBuffer(mousePos);
		}
	});
	
	elements.prevLayer.onclick = () => {
		if (parameters.currentLayer > 0) parameters.currentLayer--;
		elements.currentLayer.textContent = `Current Layer: ${parameters.currentLayer}`;
	}
	
	elements.nextLayer.onclick = () => {
		if (parameters.currentLayer < assets.layers.length - 1) 
				parameters.currentLayer++;
		elements.currentLayer.textContent = `Current Layer: ${parameters.currentLayer}`;
	}
	
	elements.addLayer.onclick = () => {
		assets.layers.push(new Layer(++parameters.currentLayer, elements.mainCanvas));
		elements.currentLayer.textContent = `Current Layer: ${parameters.currentLayer}`;
		pokemonContainer.fusion.drawFromAssets(elements.mainCanvas);
	}
	
	elements.deleteLayer.onclick = () => {
		assets.layers.splice(parameters.currentLayer, 1);
		elements.prevLayer.onclick();
		if (assets.layers.length == 0) {
			assets.layers.push(new Layer(0, elements.mainCanvas));
		}
		
		drawFromLayers();
	}
	
	elements.moveImage.onclick = () => {
		parameters.moveImage = !parameters.moveImage;
		var text = {true : "On", false : "Off"};
		elements.moveImage.textContent = `Move Image: ${text[parameters.moveImage]}`;
	}
	
}

function main() {
	setUpElements();
	//console.log(pokemonContainer.charizard.assetFlags);
	
}

main();