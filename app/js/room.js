'use strict';
var canmango = canmango || {};

(function(cm) {
	/**
	 * A 3d image gallery using easel js.
	 */
	cm.room = {
		stage: null,
		width: null,
		height: null,
		images: {},

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
			my.stage.addChild(my.container);

			my.width = my.stage.canvas.width;
			my.height = my.stage.canvas.height;

		},

		createGuides: function(options)
		{
			var options = options || {};
			var numGuides = options.numGuides || 10;

			for(var i = 0; i < numGuides; i++)
			{
				var guide = my.createGuide();
				guide.y = my.height / 10 * i;
				guide.name = 'guide' + i;
				my.container.addChild(guide);
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
			var bitmap = new createjs.Bitmap(image);
			bitmap.name = id;
			bitmap.x = options.x;
			bitmap.y = options.y;
			my.images[id] = bitmap;
			
			my.container.addChild(bitmap);

			my.stage.update();

			my.arrange();
		},

		/**
		 * Deletes all the images from the stage.
		 */
		clear: function()
		{
			my.stage.clear();
		},

		/**
		 * Loop through the image and resize and arrange them
		 * based on their height up the canvas.
		 */
		arrange: function()
		{
			my.createGuides();

			my.container.sortChildren(function(c1, c2) {
				return c1.y - c2.y;
			});	

			for (var l = 0; l  < my.container.children.length; l++) 
			{
				var child = my.container.getChildAt(l);
				var childY = child.y;
				var scale = (child.y + 1) / my.height;

				if(child.name.indexOf('guide') == -1)
				{
					child.scaleX = scale;
					child.scaleY = scale;
				}

				/**
				var childOffset = child.x - my.width / 2;
				child.x = Math.round(my.width / 2 + (childOffset * scale));
				child.y = Math.round(my.height * scale);
				*/
			};
		},
	};

	var my = cm.room;
})(canmango);
