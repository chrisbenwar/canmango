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
			my.container.sortChildren(function(c1, c2) {
				return c1.y - c2.y;
			});	

			for (var l = 0; l  < my.container.children.length; l++) 
			{
				var child = my.container.getChildAt(l);
				var childY = child.y;
				var scale = (child.y + 1) / my.height;

				child.scaleX = scale;
				child.scaleY = scale;
			};
		},
	};

	var my = cm.room;
})(canmango);
