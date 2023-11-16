function verifyRange() {
	for (let i = 0; i < arguments.length; i++) {
		if (arguments[i] < 0 || arguments[i] > 1) throw new RangeError("H, S, L, and A parameters must be between the range [0, 1]");
	}
}
// https://stackoverflow.com/a/9493060/7344257
function hslToRgb(h, s, l) {
	let r, g, b;
	if (s == 0) r = g = b = l; //Achromatic
	else {
		const hue2rgb = function(p, q, t) {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};
		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;
		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}
	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

class Color {
    constructor(h, s, l, a) {
        verifyRange(h, s, l);
        if (a === undefined) a = 1;
        else verifyRange(a);
        Object.defineProperties(this, {
            "hue": {
                value: h,
                enumerable: true
            },
            "sat": {
                value: s,
                enumerable: true
            },
            "lum": {
                value: l,
                enumerable: true
            },
            "alpha": {
                value: a,
                enumerable: true
            },
        });
    }

    interpolateToString(color, amount) {
        const rgbThis = hslToRgb(this.hue, this.sat, this.lum);
        const rgbThat = hslToRgb(color.hue, color.sat, color.lum);
        const rgb = [];
        for (let i = 0; i < 3; i++) {
            rgb[i] = Math.floor((rgbThat[i] - rgbThis[i]) * amount + rgbThis[i]);
        }
        return {
            rgbString: function() {
                return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
            }
        };
    }

    deriveLumination(amount) {
        let lum = this.lum + amount;
        lum = Math.min(Math.max(lum, 0), 1);
        return new Color(this.hue, this.sat, lum, this.alpha);
    }

    deriveHue(amount) {
        const hue = this.hue - amount;
        return new Color(hue - Math.floor(hue), this.sat, this.lum, this.alpha);
    }

    deriveSaturation(amount) {
        let sat = this.sat + amount;
        sat = Math.min(Math.max(sat, 0), 1);
        return new Color(this.hue, sat, this.lum, this.alpha);
    }

    deriveAlpha(newAlpha) {
        verifyRange(newAlpha);
        return new Color(this.hue, this.sat, this.lum, newAlpha);
    }

    rgbString() {
        const rgb = hslToRgb(this.hue, this.sat, this.lum);
        rgb[3] = this.a;
        return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${this.alpha})`;
    }
}

Color.fromData = data => {
	return new Color(data.hue, data.sat, data.lum, data.alpha);
};
Color.possColors = () => {
	const SATS = [192, 150, 100].map(val => val / 240);
	const HUES = [0, 10, 20, 25, 30, 35, 40, 45, 50, 60, 70, 100, 110, 120, 125, 130, 135, 140, 145, 150, 160, 170, 180, 190, 200, 210, 220].map(val => val / 240);
	const possColors = new Array(SATS.length * HUES.length);
	let i = 0;
	for (let s = 0; s < SATS.length; s++) {
		for (let h = 0; h < HUES.length; h++) {
			possColors[i++] = new Color(HUES[h], SATS[s], .5, 1);
		}
	}
	//Shuffle the colors
	for (let i = 0; i < possColors.length * 50; i++) {
		const a = Math.floor(Math.random() * possColors.length);
		const b = Math.floor(Math.random() * possColors.length);
		const tmp = possColors[a];
		possColors[a] = possColors[b];
		possColors[b] = tmp;
	}
	return possColors;
}

export default Color;
