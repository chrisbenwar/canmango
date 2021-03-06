'use strict';
var canmango = canmango || {};

(function(cm) {
	cm.roundDude = {
		"dude": {
			"atoms": {
				"head": { "w": 1, "h": 1, "colour1": "#990000", "colour2": "#000000", "shape": "circle" },
				"eye": { "w": 0.1, "h": 0.2, "colour1": "#ff0000", "colour2": "#000000" },
				"pupil": { "w": 0.1, "h": 0.1, "colour1": "#000000", "colour2": "#ffffff", "shape": "circle" },
				"mouth": { "w": 0.1, "h": 0.1, "colour1": "#ffffff", "colour2": "#000000", "shape": "circle" },
				"foot": { "w": 0.4, "h": 0.2, "colour1": "#990000", "colour2": "#000000", "shape": "circle" },
			},
			"parts": {
				"dude": {"x": 0, "y": 0, "abs": 1},
				"head": { "atom": "head", "parent": "dude", "abs": 1 },
				"eyes": {"parent": "head", "x": 0.5, "y": 0.3 },
				"eye1": { "atom": "eye", "parent": "eyes", "x": -0.2 },
				"eye2": { "atom": "eye", "parent": "eyes", "x": 0.2 },
				"pupil1": { "atom": "pupil", "parent": "eye1", "x": 0.05, "y": 0.1 },
				"pupil2": { "atom": "pupil", "parent": "eye2", "x": 0.05, "y": 0.1 },
				"mouth": { "atom": "mouth", "parent": "head", "x": 0.5, "y": 0.7 },
				"feet": { "parent": "dude", "x": 0.5, "y": 1 },
				"foot1": { "atom": "foot", "parent": "feet", "x": -0.25 },
				"foot2": { "atom": "foot", "parent": "feet", "x": 0.25 }
			},
			"order": [
				"dude", "head", "eyes", "eye1", "eye2", "pupil1", "pupil2",
				"mouth", "feet", "foot1", "foot2"
			]
		},
		"containers": {},
		"displayObjects": { },
		redraw: function() {
			my.containers = {};
			my.displayObjects = {};
			canmango.shapespasm.draw();
		},
		getDisplayData: function() {
			var dude = my.dude;
			var atomID = null, atom = null;
			var displayData = [];
			var desc = {
				"head": "Head", "eye": "Eyes", "pupil": "Pupils",
				"mouth": "Mouth", "foot": "Feet"
			};

			for(atomID in dude.atoms) {
				atom = dude.atoms[atomID];

				displayData.push({
					"atomID": atomID, 
					"desc": desc[atomID],	
					"w": atom.w,
					"h": atom.h,
					"colour1": atom.colour1,
					"colour2": atom.colour2,
					"shape": atom.shape
				});
			}

			return displayData;
		},
		update: function(displayData) {
			var part = null;
			var dude = my.dude;
			var atomID = displayData.atomID;

			dude.atoms[atomID].colour1 = displayData.colour1;
			dude.atoms[atomID].colour2 = displayData.colour2;
			dude.atoms[atomID].shape = displayData.shape;
			dude.atoms[atomID].w = displayData.w;
			dude.atoms[atomID].h = displayData.h;

			my.redraw();
		},
		draw: function(stage, width, height) {
			var border = 50;
			var w = width - border * 2;
			var h = height - border * 2;
			var xOff = border;
			var yOff = border;
			var parts = my.dude.parts;
			var atoms = my.dude.atoms;
			var order = my.dude.order;
			var partInfo = null, part = null, layout = null, family = null;
			var atomID = null, partID = null, atom = null;
			var x = 0, y = 0, top = 0, height = 0, d = 0, partX = 0, partY = 0;
			var parentPart = null, parentPartID = null, parentDO = null;
			var partShape = null, partG = null, displayObj = null;
			var container = null;

			for(partID in parts) {
				part = parts[partID];
				if(part.parent)
				{
					container = new createjs.Container();
					my.containers[part.parent] = container;
				}
			}

			for(var i = 0; i < order.length; i++)
			{
				partID = order[i];
				part = parts[partID];	

			}

			for(var i = 0; i < order.length; i++)
			{
				partID = order[i];

				part = parts[partID];	
				x = part.x || 0;
				y = part.y || 0;

				if(my.containers[partID])
				{
					container = my.containers[partID];

					if(part.parent)
					{
						my.containers[part.parent].addChild(container);
					}
					else
					{
						stage.addChild(container);
					}
				}

				if(my.containers[partID])
				{
					parentDO = my.containers[partID];	
				}
				else if(part.parent)
				{
					parentPart = parts[part.parent];
					parentDO = my.containers[part.parent];
				}

				if(my.containers[partID] && !part.atom)
				{
					var c = my.containers[partID];
					c.x = x * w;
					c.y = y * w;

					if(partID == 'dude')
					{
						c.x += xOff;
						c.y += yOff;
					}
				}

				if(part.atom)
				{
					atom = atoms[part.atom];
					partG = new createjs.Graphics().beginFill(atom.colour1);	
					partG.setStrokeStyle(4);
					partG.beginStroke(atom.colour2);	

					var shape = atom.shape || 'ellipse';

					if(my.containers[partID])
					{
						atom = atoms[part.atom];
						if(!part.abs)
						{
							my.containers[partID].regX = atom.w * w / 2;
							my.containers[partID].regY = atom.h * h / 2;
						}

						my.containers[partID].x = x * w;
						my.containers[partID].y = y * w;
						my.drawShape(partG, shape, atom.w * w, atom.h * h);
						displayObj = new createjs.Shape(partG);
					}
					else
					{
						my.drawShape(partG, shape, atom.w * w, atom.h * h);

						displayObj = new createjs.Shape(partG);
						displayObj.regX = atom.w * w / 2;
						displayObj.regY = atom.h * h / 2;
						displayObj.x = x * w;
						displayObj.y = y * h;
					}

					my.displayObjects[partID] = displayObj;
					parentDO.addChild(displayObj);
				}
			}
		},
		drawShape: function(g, type, w, h) {
			var radius = w;
			if(h > w) radius = h;

			switch(type)
			{
				case 'square':
					g.drawRect(0, 0, w, h);
					break;
				case 'ellipse':
				default:
					g.drawEllipse(0, 0, w, h);
					break;
			}
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

	var my = cm.roundDude;

})(canmango);
