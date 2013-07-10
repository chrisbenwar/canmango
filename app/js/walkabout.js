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
			my._worldData.push(my.createRect(0, 0, 50, 400, 20));
			my._worldData.push(my.createRect(0, 50, 50, 90, 80));
			my._worldData.push(my.createRect(0, 200, 50, 240, 200));
		},

		createRect: function(top, left, bottom, right, depth)
		{
			return [
				{x: top, y: left, z: depth}, 
				{x: top, y: right, z: depth},
				{x: bottom, y: right, z: depth},
				{x: bottom, y: left, z: depth},
				{x: top, y: left, z: depth} 
			];
		},

		draw: function(stage, w, h)
		{
			var g = new createjs.Graphics();
			var s = new createjs.Shape(g);
			var from = null;
			var to = null;

			var vEye = vec.create(0, 50, -50);
			var vTarget = vec.create(0, 0, 0);
			var vUp = vec.create(0, 0, 1);

			var mCamera = matrix.lookAt(vEye, vTarget, vUp)
			var eye = vec.create(200, 50, -50);

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
							vFromArr[3] = 0;
							var vToArr = vec.toArray(item[j + 1]);
							vToArr[3] = 0;
							from = matrix.mulVec(mCamera, vFromArr);
							var fromArr = vec.fromArray(from);
							fromArr.x = (eye.z * (fromArr.x-eye.x)) / (eye.z + fromArr.z) + eye.x;
							fromArr.y = (eye.z * (fromArr.y-eye.y)) / (eye.z + fromArr.z) + eye.y;
							console.log(JSON.stringify([item[j], from]));
							to = matrix.mulVec(mCamera, vToArr);
							var toArr = vec.fromArray(to);
							toArr.x = (eye.z * (toArr.x-eye.x)) / (eye.z + toArr.z) + eye.x;
							toArr.y = (eye.z * (toArr.y-eye.y)) / (eye.z + toArr.z) + eye.y;
							console.log(JSON.stringify([item[j + 1], to]));

							my.drawLine(stage, g, fromArr, toArr);
						}
					}
				}
			}

			stage.addChild(s);
		},

		drawLine: function(stage, g, from, to)
		{
			g.beginStroke('black');
			g.setStrokeStyle(1);
			g.moveTo(from.x, my._height - from.y - 1);
			g.lineTo(to.x, my._height - to.y - 1);
			g.endStroke();
		},

	};
	var my = cm.walkabout;
})(canmango);
