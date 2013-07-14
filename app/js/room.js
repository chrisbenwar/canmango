'use strict';
var canmango = canmango || {};

(function(cm) {
	var vec = physii.vector;
	var matrix = physii.matrix;
	var logger = futilitybelt.dev.logger;
	var ui = futilitybelt.ui;

	/**
	 * A 3d image gallery using easel js.
	 */
	cm.room = {
		stage: null,
		width: null,
		height: null,
		images: {},
		world: [],
		_x: 0,
		_y: 100,
		_z: 500,

		/**
		 * Initialize the gallery by creating an
		 * easeljs stage on the canvas.
		 *
		 * @param canvasID ID of canvas elem.
		 * @param options
		 */
		init: function(canvasID, options)
		{
			my.stage = new createjs.Stage(canvasID);
			my.container = new createjs.Container();
			my.width = my.stage.canvas.width;
			my.height = my.stage.canvas.height;


			var interval = 100;
			var speed = 2;

			var g = new createjs.Graphics();
			g.beginFill('#bbddff');
			g.drawRect(0, 0, my.width, my.height);
			my.dragger = new createjs.Shape(g);
			my.stage.addChild(my.dragger);

			my.dragger.addEventListener("mousedown", function(evt) {
				//var offset = {x:evt.target.x-evt.stageX, y:evt.target.y-evt.stageY};
				var startX = evt.stageX;
				var startY = evt.stageY;
                 
				// add a handler to the event object's onMouseMove callback
				// this will be active until the user releases the mouse button:
				evt.addEventListener("mousemove",function(ev) {
					var diffX = ev.stageX - startX;
					var diffY = ev.stageY - startY;
					cm.room._x -= diffX;
					cm.room._z += diffY;
					cm.room.arrange();
				});
			});

			my.stage.addChild(my.container);
			my.createGuides();
		},

		createGuides: function(options)
		{
			var options = options || {};
			var numGuides = options.numGuides || 10;

			for(var i = 0; i < numGuides; i++)
			{
				var z = (1000 / 10) * i;
				var guide = my.createGuide();
				guide.x = 0;
				guide.y = 0;
				guide.z = 0;
				guide.name = 'guide' + i;
				my.container.addChild(guide);
				my.world.push({
					'type': 'line',
					'pos': vec.create(0, 0, z),
					'displayObj': guide, 
					'w': my.width,
					'h': 1
				});
			}	
		},

		createGuide: function(options)
		{
			var g = new createjs.Graphics();
			var s = new createjs.Shape(g);

			g.beginStroke('black');
			g.setStrokeStyle(1);
			g.moveTo(0,0);
			g.lineTo(my.width, 0);
			g.endStroke();

			return s;
		},

		/**
		 * Create an image and add it to the stage with its
		 * size getting small the higher it is, creating the
		 * illusion of 3 dimensions.
		 *
		 * @param id An identifier to refer to the image by.
		 * @param Image The image to add.
		 * @param options {x: dist across, y: dist up}
		 */
		addImage: function(id, image, options)
		{
			var width = image.width;
			var height = image.height;
			var bitmap = new createjs.Bitmap(image);
			bitmap.name = id;
			bitmap.x = options.x;
			bitmap.y = options.y;
			bitmap.onPress = my.pressHandler;

			my.container.addChild(bitmap);

			my.world.push({
				'type': 'bitmap',
				'pos': vec.create(options.x, 0, options.y),
				'posRight': vec.create(options.x + 50, 0, options.y),
				'posTop': vec.create(options.x, 50, options.y),
				'displayObj': bitmap,
				'w': width,
				'h': height
			});
		},

		pressHandler: function(e){
			e.onMouseMove = function(ev){
				e.target.x = ev.stageX;
				e.target.y = ev.stageY;
				my.stage.update();
			 }
		},

		/**
		 * Deletes all the images from the stage.
		 */
		clear: function()
		{
			// my.stage.clear();
			my.world = [];
			my.createGuides();
			my.container.removeAllChildren();
		},

		/**
		 * Loop through the image and resize and arrange them
		 * based on their height up the canvas.
		 */
		arrange: function()
		{
			var vEye = vec.create(my._x, my._y, my._z);
			var vTarget = vec.create(my._x, 0, my._z - 200);
			var vUp = vec.create(0, 1, 0);
			var mCamera = matrix.lookAt(vEye, vTarget, vUp)

			var aspect = my.width / my.height;
			var mP = matrix.makePerspective(90, aspect, 1, 1000);

			var mFin = matrix.mul(
				matrix.swapRowsAndCols(mP), 
				matrix.swapRowsAndCols(mCamera)
			);

			var zToObj = [];

			for (var l = 0; l  < my.world.length; l++) 
			{
				var info = my.world[l];
				var type = info.type;

				var pos = info.pos;
				var posRight = vec.create(pos.x + info.w, 0, pos.z);
				var posTop = vec.create(pos.x, info.h, pos.z);
				var displayObj = info.displayObj;
				
				var newPos = my.convertPos(pos, mFin);
				var newPosRight = my.convertPos(posRight, mFin);
				var newPosTop = my.convertPos(posTop, mFin);

				zToObj.push({'z': newPos.z, 'obj': displayObj});

				var scaleX = Math.abs(newPosRight.x - newPos.x) / info.w;
				var scaleY = Math.abs(newPosTop.y - newPos.y) / info.h;

				displayObj.x = Math.round(newPosTop.x);
				displayObj.y = Math.round(newPosTop.y);
				displayObj.scaleX = scaleX;

				if(type == 'bitmap')
				{
					displayObj.scaleY = scaleY;
				}
			};

			zToObj.sort(function(a, b) {
				return b.z - a.z;
			});

			for(var i = 0; i < zToObj.length; i++)
			{
				var info = zToObj[i];

				my.container.addChildAt(info.obj, i);
			}
			my.stage.update();
		},

		convertPos: function(pos, mFin)
		{
			var posArr = vec.toArray(pos);	
			posArr[3] = 1;
			posArr[2] = -posArr[2];


			var newPosArr = matrix.mulVec(mFin, posArr);
			newPosArr[0] /= newPosArr[3];
			newPosArr[1] /= newPosArr[3];
			newPosArr[2] /= newPosArr[3];
			newPosArr[3] /= newPosArr[3];

			var newPos = vec.fromArray(newPosArr);

			newPos.x = newPos.x * this.width;
			newPos.y = (this.height - (newPos.y * this.height));

			return newPos;
		}
	};

	var my = cm.room;
})(canmango);
