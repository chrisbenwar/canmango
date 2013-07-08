'use strict';
var canmango = canmango || {};

(function(cm) {
	cm.shapinSafari = {
		_canvas: null,
		_ui: null,
		_editor: null,
		_imageLoader: null,
		_room: null,

		_defaultDesign: {
			elems: [
				{
					id: 'rect',
					points: [
						{ x: 0.2, y: 0.2, curve: 0.0 },
						{ x: 0.4, y: 0.2, curve: 0.0  },
						{ x: 0.4, y: 0.4, curve: 0.0  },
						{ x: 0.2, y: 0.4, curve: 0.0  }, 
					],
					fillStyle: '#ee2',
					strokeStyle: '#b00',
					lineWidth: 0.05
				}
			]
		},

		save: function()
		{
			var $nameInput = $('#shapeName');
			var name = $nameInput.val();
			var design = my._editor.getDesign();
			amplify.store(name, design);
			this.loadSaved();
		},

		loadSaved: function()
		{
			var designs = amplify.store();
			var imgDataURL = null, design = null;
			var image = null;
			
			my._room.clear();

			for(var canvasID in designs)
			{
				design = designs[canvasID];
				my._imageLoader.loadDesign(design);
				my._imageLoader.drawDesign();
				tempCanvas.style.display = 'block';
				imgDataURL = my._imageLoader.toDataURL(); 
				tempCanvas.style.display = 'none';
				image = new Image();
				image.src = imgDataURL;

				var randX = Math.floor(Math.random() * my._room.width);
				var randY = Math.floor(Math.random() * my._room.height);

				my._room.addImage(canvasID, image, {x: randX, y: randY});
			}
		},

		updateHandles: function(shapeID, ignoreID)
		{
			var shapes = my._editor.getShapes();
			var shape = shapes[shapeID];
			shape.scale(my._canvas.width, my._canvas.height);
			var numPoints = shape.numPoints();

			for(var i = 0; i < numPoints; i++) 
			{
				var point = shape.getPoint(i);
				var curve = shape.getCurve(i);

				var handleID = shapeID + '-' + i;

				if(handleID != ignoreID)
				{
					var curveHandleID = handleID + '-curve';

					my._ui.moveHandle(handleID, point.x, point.y);

					if(curve)
					{
						my._ui.moveHandle(curveHandleID, curve.x, curve.y);
					}
				}
			}
		},

		init: function(design) 
		{
			my._design = design || my._defaultDesign;

			var tempCanvas = document.getElementById('tempCanvas');
			my._imageLoader = editor2d(tempCanvas);

			my._canvas = document.getElementById('canmangoCanvasUnderlay');
			my._editor = editor2d(my._canvas);
			my._editor.loadDesign(my._design);

			my._ui = cm.shaperUI;
			my._ui.init('canmangoCanvasOverlay');

			my._room = cm.room;
			my._room.init('designs');

			var shapes = my._editor.getShapes();
			var shape = shapes['rect'];
			shape.scale(my._canvas.width, my._canvas.height);
			var numPoints = shape.numPoints();

			for(var i = 0; i < numPoints; i++) 
			{
				var point = shape.getPoint(i);
				var curve = shape.getCurve(i);

				var handleID = 'rect-' + i;

				my._ui.createHandle('rect-' + i, {
					moveHandler: function(e) {
						var x = e.target.x;
						var y = e.target.y;
						var handleID = e.target.name;

						var idParts = handleID.split('-');
						var shapeID = idParts[0];
						var index = idParts[1];

						var shapes = my._editor.getShapes();
						var shape = shapes[shapeID];
						
						shape.setPoint(index, x, y);
						my.draw();

						var curve = shape.getCurve(index);

						my.updateHandles('rect', 'rect-' + i);
					},
					pos: [point.x, point.y]
				});

				if(curve)
				{
					var curveID = handleID + '-curve';

					my._ui.createHandle(curveID, {
						moveHandler: function(e) {
							var x = e.target.x;
							var y = e.target.y;
							var handleID = e.target.name;

							var idParts = handleID.split('-');
							var shapeID = idParts[0];
							var index = idParts[1];

							var shapes = my._editor.getShapes();
							var shape = shapes[shapeID];

							shape.setCurve(index, x, y);
							my.draw(); 

							my.updateHandles('rect');
						},
						pos: [curve.x, curve.y],
						fillColour: '#ffffaa'
					});

					var prevHandleIndex = i - 1;
					if(prevHandleIndex < 0) prevHandleIndex = numPoints - 1;
					var prevHandleID = 'rect-' + prevHandleIndex;

					my._ui.createGuide({
						'fromID': curveID, 'toID': handleID, 'strokeColour': '#dddddd'
					});

					my._ui.createGuide({
						'fromID': curveID, 'toID': prevHandleID, 'strokeColour': '#dddddd'
					});
				}
			}

			my.draw();
		},

		draw: function() {
			my._editor.drawDesign();
		}
	}

	var my = cm.shapinSafari;
	
})(canmango);
