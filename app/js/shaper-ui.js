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

		_guides: [],
		_guideG: null,
		_guideS: null,
		
		init: function(canvasID) {
			my._stage = new createjs.Stage(canvasID);
			my._width = my._stage.canvas.width;
			my._height = my._stage.canvas.height;
			my._guideG = new createjs.Graphics();
			my._guideS = new createjs.Shape(my._guideG);

			my._stage.addChild(my._guideS);
		},
		
		bringHandlesToFront: function() {
			var stage = my._stage;
			
			for(var handleID in my._handles)
			{
				stage.addChild(my._handles[handleID].displayObject);
			}
		},

		/**
		 * Creates an element in the _handles array.
		 * @param id The id to identify it by
		 * @param p {
		 *   pos: [x, y] The start pos for it.
		 *   moveHandler: Callback for when handle is moved.
		 *   fillColour: Colour to fill with.
		 *   strokeColour: Colour to stroke with.
		 * }
		 */
		createHandle: function(id, p)
		{
			var fillColour = p.fillColour || '#cccccc';
			var strokeColour = p.strokeColour || '#aaaaaa';
			var g = my.drawHandle(fillColour, strokeColour);

			var shape = new createjs.Shape(g);
			shape.x = p.pos[0];
			shape.y = p.pos[1];
			shape.onPress = my.pressHandler;
			shape.name = id;

			my._handles[id] = {
				'p': p,
				'displayObject': shape
			};
			my._stage.addChild(shape);
			my._stage.update();
		},

		/**
		 * Add a guide line between two handles.
		 *
		 * param p {
		 *   fromID: // ID of handle to draw from.
		 *   toID: // ID of handle to draw to.
		 * }
		 */
		createGuide: function(p)
		{
			my._guides.push(p);
		},

		drawGuides: function()
		{

			my._guideG.clear();

			for(var id in my._guides)
			{
				var p = my._guides[id];
				var strokeColour = p.strokeColour || '#aaaaaa';
				var strokeWidth = p.strokeWidth || 2;
				var fromID = p.fromID;
				var toID = p.toID;

				my._guideG.setStrokeStyle(1);
				my._guideG.beginStroke(strokeWidth);
				var guideFrom = my._handles[fromID].displayObject;
				var guideTo = my._handles[toID].displayObject;

				my._guideG.moveTo(guideFrom.x, guideFrom.y);
				my._guideG.lineTo(guideTo.x, guideTo.y);
			}
		},

		moveHandle: function(handleID, x, y)
		{
			var handle = my._handles[handleID];

			handle.displayObject.x = x;
			handle.displayObject.y = y;
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
			var r = 10;
			g.drawCircle(0,0,r);
			g.moveTo(0,-r);
			g.lineTo(0,r);
			g.moveTo(-r,0);
			g.lineTo(r,0);
			return g;
		}, 

		pressHandler: function(e){
			e.onMouseMove = function(ev){
				e.target.x = ev.stageX;
				e.target.y = ev.stageY;

				var handleID = e.target.name;
				var h = my._handles[handleID];

				if(h && h.p)
				{
					if(h.p.moveHandler)
					{
						h.p.moveHandler(e);
					}
				}

				my.drawGuides();

				my._stage.update();
			 }
		}
	}

	var my = cm.shaperUI;

})(canmango)
