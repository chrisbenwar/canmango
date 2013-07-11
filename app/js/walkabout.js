'use strict';
var canmango = canmango || {};

(function(cm) {
	var vec = physii.vector;
	var matrix = physii.matrix;

	cm.walkabout = {
		_canvas: null,
		_width: null,
		_height: null,

		_worldData: [],
		_worldWidth: 400,
		_worldHeight: 400,
		
		init: function(shapespasm)
		{
			my._width = shapespasm.width;
			my._height = shapespasm.height;
			my.addGuides();	

			my.addRects();
		},

		addGuides: function()
		{
			var numGuides = 10;

			for(var i = 0; i < numGuides; i++)
			{
				var zOff = (my._worldHeight / numGuides) * i;

				my._worldData.push(
					my.createGuide(0, 0, zOff, my._worldWidth, 0, zOff)
				);	
			}
		},

		createGuide: function(x1, y1, z1, x2, y2, z2)
		{
			return [
				{x: x1, y: y1, z: z1}, {x: x2, y: y2, z: z2}
			];
		},

		addRects: function()
		{
			my._worldData.push(my.createRect(0, 280, 20, 340, 20));
			my._worldData.push(my.createRect(0, 50, 50, 90, 80));
			my._worldData.push(my.createRect(0, 200, 150, 240, 200));
		},

		createRect: function(top, left, bottom, right, depth)
		{
			return [
				{x: left, y: top, z: depth}, 
				{x: right, y: top, z: depth},
				{x: right, y: bottom, z: depth},
				{x: left, y: bottom, z: depth},
				{x: left, y: top, z: depth} 
			];
		},

		draw: function(stage, w, h)
		{
			var g = new createjs.Graphics();
			var s = new createjs.Shape(g);
			var from = null;
			var to = null;

			var vEye = vec.create(200, 50, -150);
			var vTarget = vec.create(200, 0, 0);
			var vUp = vec.create(0, 1, 0);

			var mCamera = matrix.lookAt(vEye, vTarget, vUp)
			var aspect = my._width / my._height;
			var mP = matrix.makePerspective(90, aspect, 1, 1000);
			console.log( JSON.stringify(['mP', mP]));
			var mFin = matrix.mul(
					matrix.swapRowsAndCols(mP), matrix.swapRowsAndCols(mCamera));
			//mFin = matrix.swapRowsAndCols(mFin);

			for(var i = 0; i < my._worldData.length; i++)
			{
				var item = my._worldData[i];

				if(item.length)
				{
					for(var j = 0; j < item.length; j++)
					{
						if(item[j + 1])
						{
							var vFromArr = vec.toArray(item[j]);
							vFromArr[3] = 1;
							var vToArr = vec.toArray(item[j + 1]);
							vToArr[3] = 1;

							from = matrix.mulVec(mFin, vFromArr);
							from[0] /= from[3]; 
							from[1] /= from[3]; 
							from[2] /= from[3]; 
							from[3] /= from[3]; 
							var vFrom = vec.fromArray(from);
							console.log(JSON.stringify([item[j], vFrom]));

							to = matrix.mulVec(mFin, vToArr);
							to[0] /= to[3]; 
							to[1] /= to[3]; 
							to[2] /= to[3]; 
							to[3] /= to[3]; 
							var vTo = vec.fromArray(to);
							console.log(JSON.stringify([item[j + 1], vTo]));

							my.drawLine(stage, g, vFrom, vTo);
						}
					}
				}
			}

			stage.addChild(s);
		},

		drawLine: function(stage, g, from, to)
		{
			var h = my._height - 200;
			var w = my._width - 200;
			var midX = my._width / 2;
			var midY = my._height / 2;
			g.beginStroke('black');
			g.setStrokeStyle(1);
			console.log( JSON.stringify([from.y, h - from.y]));

			g.moveTo(from.x * w + midX, h - from.y * h);
			g.lineTo(to.x * w + midX, h - to.y * h);

			g.endStroke();
		},

	};
	var my = cm.walkabout;
})(canmango);
