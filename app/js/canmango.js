'use strict';
var canmango = canmango || {};

(function(cm) {
	cm.shapespasm = {
		canvas: null,
		width: null,
		height: null,
		ctx: null,
		stage: null,
		drawer: null,

		setDrawer: function(drawer) {
			cm.shapespasm.drawer = drawer;
		},
		init: function() {
			var my = cm.shapespasm;

			my.stage = new createjs.Stage("canmangoCanvas");
			my.width = my.stage.canvas.width;
			my.height = my.stage.canvas.height;

			var shape = new createjs.Shape();

			if(my.drawer) {
				my.drawer.draw(shape, my.width / 10, my.height / 10);
			}

			my.stage.addChild(shape);
			my.stage.update();
		},
	},	

	cm.roundDude = {
		"dude": {
			"parts": {
				"head": { "w": 1, "h": 1, "colour1": "brown", "colour2": "black" },
				"eye": { "w": 0.4, "h": 0.2, "colour1": "white", "colour2": "black" },
				"pupil": { "w": 0.05, "h": 0.05, "colour1": "black", "colour2": "black" },
				"mouth": { "w": 0.6, "h": 0.1, "colour1": "yellow", "colour2": "black" },
				"foot": { "w": 0.4, "h": 0.2, "colour1": "black", "colour2": "black" },
			},
			"families": {
				"head": { "part": "head" },
				"eye1": { "part": "eye", "parent": "head" },
				"eye2": { "part": "eye", "parent": "head" },
				"pupil1": { "part": "pupil", "parent": "eye1" },
				"pupil2": { "part": "pupil", "parent": "eye2" },
				"mouth": { "part": "mouth", "parent": "head" },
				"foot1": { "part": "foot", "parent": "head" },
				"foot2": { "part": "foot", "parent": "head" }
			},
			"layouts": {
				"head": { "parts": ["head"] , "y": 0},
				"eyes": { "parts": ["eye1", "eye2"], "d": 0.5, "y": 0.3 },
				"pupils": { "parts": ["pupil1", "pupil2"], "x": 0.1, "y": 0.1 },
				"mouth": { "parts": ["mouth"], "y": 0.7 },
				"feet": { "parts": ["foot1", "foot2"], "d": 0.5, "y": 0.9 }
			}
		},
		"cache": { },
		draw: function(shape, w, h) {
			var g = shape.graphics;
			var my = canmango.roundDude;
			var parts = my.dude.parts;
			var layouts = my.dude.layouts;
			var families = my.dude.families;
			var partInfo = null, part = null, layout = null, family = null;
			var atomID = null, partID = null;
			var x = 0, y = 0, top = 0, height = 0, d = 0, partX = 0, partY = 0;
			var parentPos = null, parentPartID = null;
			
			for(var layoutID in layouts) {
				layout = layouts[layoutID];
				x = layout.x || 0;
				y = layout.y || 0;
				d = layout.d || 0;

				for(var i = 0; i < layout.parts.length; i++)
				{
					partX = x;
					partY = y;

					partX += d * i;
					partID = layout.parts[i];
					atomID = families[partID].part;
					part = parts[atomID];

					parentPartID = families[partID].parent;
					parentPos = my.cache[parentPartID];
					if(parentPos)
					{
						partX += parentPos.x;
						partY += parentPos.y;
					}

					my.cache[partID] = { "x": partX, "y": partY };
					
					my.drawPart(g, part, partX, partY, w, h);
				}
			}
		},
		drawPart: function(g, part, x, y, w, h) {
				var height = h * part.h;

				g.beginFill(part.colour1);
				g.drawEllipse(x * w, y * h, w * part.w, h * part.h);
		},
		drawParts: function(shape, w, h) {
			var g = shape.graphics;
			var parts = canmango.roundDude.dude.parts;
			var partInfo = null, part = null;
			var top = 0, height = 0;
			
			for(var partID in parts) {
				part = parts[partID];
				height = h * part.h;

				g.beginFill(part.colour1);
				g.drawEllipse(0, top, w * part.w, h * part.h);

				top += height;
			}
		},
	}

})(canmango);
