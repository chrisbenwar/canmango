'use strict';
var canmango = canmango || {};

/**
 * UI in easel js for controlling canvas drawings.
 *
 * Handles and things like that.
 */

(function(cm) {
	cm.shaperUI = {
		_p: null,
		_canvas: null,
		_stage: null,
		_width: null,
		_height: null,

		/**
		 * _handles = {
		 *   handleID: {
		 *	   
		 *   }
		 * }
		 */
		_handles: {},
		
		init: function(canvasID) {
			my._stage = new createjs.Stage(canvasID);
			my._width = my._stage.canvas.width;
			my._height = my._stage.canvas.height;
		},
		
		bringHandlesToFront: function() {
			var stage = my._stage;
			
			for(var handleID in my._handles)
			{
				stage.addChild(my._handles[handleID]);
			}
		},

		/**
		 * Creates an elemynt in the _handles array.
		 * @param id The id to identify it by
		 * @param properties {
		 *   handler: Callback for when this is pressed.
		 *   pos: [x, y] The start pos for it.
		 * }
		 */
		createHandle: function(id, properties)
		{
			var g = my.drawHandle('blue', 'green');

			var pressHandler = properties.pressHandler || my.pressHandler;

			var shape = new createjs.Shape(g);
			shape.id = 'pos';
			shape.x = properties.pos[0];
			shape.y = properties.pos[1];
			shape.onPress = pressHandler;
			my._handles[id] = shape;
			my._stage.addChild(shape);
			my._stage.update();
		},

		/**
		 * Draw a handle using primitive drawing ops.
		 * @returns g Instance of easeljs graphics
		 */
		drawHandle: function(fillColour, strokeColour)
		{
			var g = new createjs.Graphics();
			g.setStrokeStyle(1);
			g.beginStroke(strokeColour);
			g.beginFill(fillColour);
			g.drawCircle(0,0,10);
			return g;
		}, 

		pressHandler: function(e){
			e.onMouseMove = function(ev){
				e.target.x = ev.stageX;
				e.target.y = ev.stageY;
				my._stage.update();
			 }
		}
	}

	var my = cm.shaperUI;

})(canmango)
