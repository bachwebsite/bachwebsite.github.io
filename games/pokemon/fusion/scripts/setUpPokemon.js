class Pokemon {
	constructor(name, prefix, suffix) {
		this.name = name;
		this.prefix = prefix;
		this.suffix = suffix;
		this.folder = "images/" + this.name;
		this.assetFlags = {
			"head" : false,
			"arms": false,
			"wings" : false,
			"legs" : false,
			"tail" : false
			
		};

		this.assets = {
			"base" : {image: null, x1: 0, y1: 0, x2: 0, y2: 0, inFront : true}, 
			"head" : {image: null, x1: 0, y1: 0, x2: 0, y2: 0,  inFront : true}, 
			"tail" : {image: null, x1: 0, y1: 0, x2: 0, y2: 0,  inFront : true},
			"legLeft" : {image: null, x1: 0, y1: 0, x2: 0, y2: 0,  inFront : true},
			"legRight" : {image: null, x1: 0, y1: 0, x2: 0, y2: 0,  inFront : true},
			"wingLeft" : {image: null, x1: 0, y1: 0, x2: 0, y2: 0,  inFront : true},
			"wingRight" : {image: null, x1: 0, y1: 0, x2: 0, y2: 0,  inFront : true},
			"armLeft" : {image: null, x1: 0, y1: 0, x2: 0, y2: 0,  inFront : true},
			"armRight" : {image: null, x1: 0, y1: 0, x2: 0, y2: 0,  inFront : true}
		};
	}
	
	setAssetFlags(flagArray) {
		for (var i = 0; i < flagArray.length; i++) {
			this.assetFlags[flagArray[i]] = true;
		}
	}
	
	loadPokemonAssets() {
		this.assets.base.image = this.getImage(this.name + "_limbless.png");
		if (this.assetFlags.head) 
			this.assets.head.image = this.getImage(this.name + "_head.png");
		if (this.assetFlags.tail) 
			this.assets.tail.image = this.getImage(this.name + "_tail.png");
		if (this.assetFlags.arms) {
			this.assets.armLeft.image = this.getImage(this.name + "_armLeft.png");
			this.assets.armRight.image = this.getImage(this.name + "_armRight.png");
		}
		if (this.assetFlags.wings) {
			this.assets.wingLeft.image = this.getImage(this.name + "_wingLeft.png");
			this.assets.wingRight.image = this.getImage(this.name + "_wingRight.png");
		}
		if (this.assetFlags.legs) {
			this.assets.legLeft.image = this.getImage(this.name + "_legLeft.png");
			this.assets.legRight.image = this.getImage(this.name + "_legRight.png");
		}
	}
	
	getImage(imageName) {
		var image = new Image();
		image.src = this.folder + "/" + imageName;
		return image;
	}
	
	setAssetReceivePosition(asset, position) {
		this.assets[asset].x1 = position.x;
		this.assets[asset].y1 = position.y;
	}
	
	setAssetPlacePosition(asset, position) {
		this.assets[asset].x2 = position.x;
		this.assets[asset].y2 = position.y;
	}
	
	setBehind(assets) {
		for (var i = 0; i < assets.length; i++) {
			this.assets[assets[i]].inFront = false;
		}
	}
	
	drawFromAssets(canvas) {
		var ctx = canvas.getContext("2d");
		var x, y;
		var asset;
		
		for (var key in this.assets) {
			asset = this.assets[key];
			if (!asset.inFront) {
				x = asset.x1 - asset.x2;
				y = asset.y1 - asset.y2;
				ctx.drawImage(asset.image, x, y);
			}
		}
		for (var key in this.assets) {
			asset = this.assets[key];
			if (asset.inFront) {
				x = asset.x1 - asset.x2;
				y = asset.y1 - asset.y2;
				ctx.drawImage(asset.image, x, y);
			}
		}
	}
	
	getAssetsFrom(pokemon, assetKeys) {
		for (var i = 0; i < assetKeys.length; i++) {
			this.assets[assetKeys[i]] = pokemon.assets[assetKeys[i]];
		}
	} 
}

function createFusion(pokemon1, pokemon2) {
	var pokemon1 = pokemonContainer[pokemon1];
	var pokemon2 = pokemonContainer[pokemon2];
	var fusion = new Pokemon("fusion", pokemon1.prefix, pokemon2.suffix);
	console.log(fusion.prefix + fusion.suffix);
	
	assetKeys = ["armLeft", "armRight", "wingLeft", "wingRight", "head", "tail"];
	fusion.getAssetsFrom(pokemon2, assetKeys);
	fusion.getAssetsFrom(pokemon1, ["base", "legLeft", "legRight"]);
	
	return fusion;
}

function setUpPokemon() {
	var charizard = new Pokemon("charizard", "chari", "zard");
	pokemonContainer.charizard = charizard;
	charizard.setAssetFlags(["head", "arms", "wings", "legs", "tail"]);
	charizard.loadPokemonAssets();
	charizard.setAssetReceivePosition("base", {x: 0, y: 0});
	charizard.setAssetReceivePosition("head", {x: 30, y: 46});
	charizard.setAssetReceivePosition("tail", {x: 60, y: 65});
	charizard.setAssetReceivePosition("armLeft", {x: 34, y: 51});
	charizard.setAssetReceivePosition("armRight", {x: 51, y: 50});
	charizard.setAssetReceivePosition("wingLeft", {x: 40, y: 42});
	charizard.setAssetReceivePosition("wingRight", {x: 48, y: 47});
	charizard.setAssetReceivePosition("legLeft", {x: 32, y: 70});
	charizard.setAssetReceivePosition("legRight", {x: 55, y: 68});
	
	charizard.setAssetPlacePosition("base", {x: 0, y: 0});
	charizard.setAssetPlacePosition("head", {x: 17, y: 14});
	charizard.setAssetPlacePosition("tail", {x: 32, y: 59});
	charizard.setAssetPlacePosition("armLeft", {x: 16, y: 3});
	charizard.setAssetPlacePosition("armRight", {x: 1, y: 4});
	charizard.setAssetPlacePosition("wingLeft", {x: 28, y: 23});
	charizard.setAssetPlacePosition("wingRight", {x: 1, y: 27});
	charizard.setAssetPlacePosition("legLeft", {x: 9, y: 3});
	charizard.setAssetPlacePosition("legRight", {x: 5, y: 2});
	
	charizard.setBehind(["tail", "armLeft", "wingLeft", "wingRight", "legLeft"]);
	
	var dragonite = new Pokemon("dragonite", "drago", "nite");
	pokemonContainer.dragonite = dragonite;
	dragonite.setAssetFlags(["head", "arms", "wings", "legs", "tail"]);
	dragonite.loadPokemonAssets();
	dragonite.setAssetReceivePosition("base", {x: 0, y: 0});
	dragonite.setAssetReceivePosition("head", {x: 29, y: 39});
	dragonite.setAssetReceivePosition("tail", {x: 90, y: 90});
	dragonite.setAssetReceivePosition("armLeft", {x: 34, y: 51});
	dragonite.setAssetReceivePosition("armRight", {x: 48, y: 53});
	dragonite.setAssetReceivePosition("wingLeft", {x: 45, y: 52});
	dragonite.setAssetReceivePosition("wingRight", {x: 48, y: 57});
	dragonite.setAssetReceivePosition("legLeft", {x: 32, y: 70});
	dragonite.setAssetReceivePosition("legRight", {x: 55, y: 68});
	
	dragonite.setAssetPlacePosition("base", {x: 0, y: 0});
	dragonite.setAssetPlacePosition("head", {x: 17, y: 14});
	dragonite.setAssetPlacePosition("tail", {x: 32, y: 59});
	dragonite.setAssetPlacePosition("armLeft", {x: 16, y: 3});
	dragonite.setAssetPlacePosition("armRight", {x: 1, y: 4});
	dragonite.setAssetPlacePosition("wingLeft", {x: 28, y: 23});
	dragonite.setAssetPlacePosition("wingRight", {x: 1, y: 27});
	dragonite.setAssetPlacePosition("legLeft", {x: 9, y: 3});
	dragonite.setAssetPlacePosition("legRight", {x: 5, y: 2});
	
	dragonite.setBehind(["tail", "armLeft", "wingLeft", "wingRight", "legLeft"]);
	
	
}

var pokemonContainer = {};
setUpPokemon();
pokemonContainer["fusion"] = createFusion("charizard", "dragonite");