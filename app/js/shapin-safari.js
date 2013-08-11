'use strict';
var canmango = canmango || {};

(function(cm) {
	var logger = futilitybelt.dev.logger;
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
			my._room.bindMoveEnd(my.onMoveEnd, my);

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

			my.loadSaved();
		},

		onMoveEnd: function(info)
		{
			var obj = amplify.store(info.id);
			obj.pos = [info.pos.x, info.pos.y, info.pos.z];
			amplify.store(info.id, obj);
		},

		clear: function()
		{
			var designs = amplify.store();

			for(var designID in designs)
			{
				amplify.store(designID, null);
			}
		},

		save: function()
		{
			var $nameInput = $('#shapeName');
			var name = $nameInput.val();
			var design = my._editor.getDesign();
			var obj = {
				'design': design,
				'pos': [0, 0, 0]
			};

			var imageGroup = [];
			var result = my.designToImageURL(design);
			my.imageSize[name] = {"w": result.w, "h": result.h};
			imageGroup.push({ "id": name, "src": result.dataURL} );
			imageGroupSrc(imageGroup, my.imageLoad);

			amplify.store(name, obj);
		},

		loadSaved: function()
		{
			var designs = amplify.store();
			var imgDataURL = null, design = null, id = null;
			var image = null;
			var pos = null, obj = null;
			
			my._room.clear();

			var imageGroup = [];
			my.imageSize = {};
			for(var id in designs)
			{
				obj = designs[id];
				pos = obj.pos;

				var result = my.designToImageURL(obj.design);

				imageGroup.push({ "id": id, "src": result.dataURL} );
				my.imageSize[id] = {"w": result.w, "h": result.h};
			}

			imageGroupSrc(imageGroup, my.imageLoad);
		},

		imageLoad: function(images)
		{
			for(var id in images)
			{
				var image = images[id];
				var obj = amplify.store(id);
				var pos = obj.pos;
				var w = my.imageSize[id].w;
				var h = my.imageSize[id].h;
				my._room.addImage(id, image, [pos[0], 0, pos[2]], w, h, true);
			}
			my._room.arrange();
		},

		designToImageURL: function(design)
		{
			my._imageLoader.loadDesign(design);
			my._imageLoader.drawDesign();
			tempCanvas.style.display = 'block';
			var result = my._imageLoader.toDataURLClipped(); 
			return result;
		},

		designToImage: function(design)
		{
			my._imageLoader.loadDesign(design);
			my._imageLoader.drawDesign();
			tempCanvas.style.display = 'block';
			var result = my._imageLoader.toDataURLClipped(); 
			var imgDataURL = result.dataURL; 
			var width = result.w;
			var height = result.h;
			tempCanvas.style.display = 'none';
			var image = new Image();
			image.src = imgDataURL;
			image.width = width;
			image.height = height;
			return image;
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


		draw: function() {
			my._editor.drawDesign();
		}
	}

	var my = cm.shapinSafari;
	
})(canmango);
