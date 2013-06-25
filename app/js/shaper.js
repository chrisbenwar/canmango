/**
 * Creates an editor that reads a definition of a shape
 * in JSON and converts it to a shape on canvas.
 *
 * It uses jQuery for some functionality.
 *
 * It has some ui code for editing the shapes using the
 * dragdealer ui library. This could do with pulling out
 * into a separate library.
 *
 * @param canvas The canvas to draw the shape to.
 */
var editor2d = function(canvas) {
	var _canvas = canvas;
	
	var _width = $(_canvas).width(); 
	var _height = $(_canvas).height();
	
	var ctx = _canvas.getContext('2d');
	
	var _backCanvas = null;
	
	var _canvasCache = {};
	
	var _design = {};
	var _elemIDToIndex = {};

	var _shapes = {};
	var _textures = {};
	
	var that = {
		/**
		 * Clear the canvas. Using whatever fill colour is currently
		 * set. 
		 */
		clear: function() {
			ctx.clearRect(0, 0, _width, _height);   
			return; 
		},
		
		/**
		 * Load a shape definition in json format.
		 *
		 * A basic design goes like this:
		 * ( To draw a square above a roundy rectangle )
		 *
		 * You set a function called 'designLoaded' on the returned
		 * editor2d object. This will be called when all the textures
		 * have been loaded and the design has been rendered. You can then
		 * copy the design to an image or clear loading screens.
		 *
		 * design = {
		 *   elems: [
		 *     {
		 *       id: 'rect',
		 *       points: [
		 *         { x: 0.2, y: 0.2 },
		 *         { x: 0.4, y: 0.2 },
		 *         { x: 0.4, y: 0.4 },
		 *         { x: 0.2, y: 0.4 }, 
		 *       ],
		 *       fillStyle: '#999',
		 *       strokeStyle: 'yellow',
		 *       lineWidth: 4
		 *     },
		 *     {
		 *       id: 'roundStripyRect', 
		 *       points: [
		 *         { x: 0.2, y: 0.4 },
		 *         { x: 0.4, y: 0.4, curve: 0.4 },
		 *         { x: 0.4, y: 0.6 },
		 *         { x: 0.2, y: 0.6, curve: 0.4 }, 
		 *       ],
		 *       fillStyle: '#999',
		 *       strokeStyle: 'yellow',
		 *       lineWidth: 0,
		 *       pattern: {
		 *		     id: 'shirt',
		 *		     type: 'stripes', 
		 *		     colour1: '#38BDD1',
		 *		     width1: 0.4,
		 *		     colour2: '#000000',
		 *		     width2: 0.3,
		 *		     colour3: '#ffffff',
		 *		     width3: 0.04, 
		 *		     size: 0.25,
		 *		     rotation: 0,
		 *		     repeat: 0
		 *	     },
		 *	     texture: '/my/relative/path/myOverlay.png',
		 *     }
		 *   ]
		 * }
		 */
		loadDesign: function(design) {
			_design = design;
		
			var textures = [];

			
			for(var i = 0; i < design.elems.length; i++) {
				var elem = design.elems[i];

				var shapeObj = shape(elem);
				shapeObj.setID(design.elems[i].id);

				if('pattern' in elem)
				{
					shapeObj.setPattern(elem.pattern);	
				}

				if('texture' in elem)
				{
					shapeObj.setTexture(elem.texture);
					textures.push({"id": elem.texture, "src": elem.texture});
				}

				if('lines' in elem)
				{
					shapeObj.setLines(elem.lines);
					
					$.each(elem.lines, function(index, lineData) {
						var lineID = design.elems[i].id + '-lines-' + index;
						dragListeners[lineID] = lineData;
					});
				}
				
				_shapes[elem.id] = shapeObj;
				_elemIDToIndex[elem.id] = i;
			}
			
			/*
			 * Set up any links so that changes in one element will
			 * be reflected in the other.
			 */
			for(var i = 0; i < design.elems.length; i++) {
				var elem = design.elems[i];
				
				if(elem.link)
				{
					this.linkElems(elem.id, elem.link);
				}
			}
			
			/*
			 * If there is some ui program registered to edit the design
			 * then set up the links to that here.
			 */
			for(var i = 0; i < design.elems.length; i++) {
				var elem = design.elems[i];
			
				if('pattern' in elem)
				{
					if(window.initPatternUI)
					{
						initPatternUI(elem);
					}
				}

				if('lines' in elem)
				{
					if(window.initLineUI)
					{
						initLineUI(elem);
					}
				}
				
				if(window.initUI)
				{
					initUI(elem);
				}
			}
			
			/*
			 * Load the texture images into dom elements.
			 *
			 * Call 'designLoaded' when this is finished.
			 */
			imageGroupSrc(textures, function(images) {
				for(var imageSrc in images)
				{
					_textures[imageSrc] = images[imageSrc];
				}
				that.drawDesign();
				if(that.designLoaded)
				{
					that.designLoaded();
				}
			});
		},
		
		/*
		 * This initializes the editing of a line. It is a ui
		 * linking function. It creates the draggers on the line if
		 * there are any set up.
		 *
		 * @param selectorID In format elemID-lineIndex. E.g.
		 *                   mySquare-1 means edit line with index 1
		 *                   on the mySquare part of the design. 
		 */
		changeLine: function(selectorID)
		{
			var selectorParts = selectorID.split('-');	
			
			if(selectorParts.length > 3)
			{
				var elemID = selectorParts[0];
				var elemIndex = _elemIDToIndex[elemID];
				var lineIndex = selectorParts[2];
				
				var currentLineData = _design.elems[elemIndex]['lines'][lineIndex];
				
				if(currentLineData)
				{
					var idParts = selectorID.split('-');
					idParts[3] = 'edit';
					var editCheckBox = $('#' + idParts.join('-'));

					editCheckBox.attr('checked', true);
					toggleDraggers(editCheckBox[0]);
				}
			}
		},

		deleteLine: function(selectorID)
		{
			var selectorParts = selectorID.split('-');	
			
			if(selectorParts.length > 3)
			{
				var elemID = selectorParts[0];
				var elemIndex = _elemIDToIndex[elemID];
				var lineIndex = selectorParts[2];
				var elem = _design.elems[elemIndex];
				
				var currentLineData = elem['lines'][lineIndex];
				
				if(currentLineData)
				{
					var lineID = _design.elems[elemIndex].id + '-lines-' + lineIndex;
					
					delete _design.elems[elemIndex]['lines'][lineIndex];
					delete dragListeners[lineID];
					
					if(elem.link)
					{
						if(elem.link["lines"][lineIndex])
						{
							var linkElemID = elem.link.id;
							var linkIndex = _elemIDToIndex[linkElemID];
							delete _design.elems[linkIndex]['lines'][lineIndex]
						}
					}
				}
				
				initLineUI(_design.elems[elemIndex]);
				
				$('.dragger').removeAttr('id').hide();
			}
		
			this.drawDesign();
		},

		/*
		 * Check if this element is linked to any other. If it is
		 * then changes to the other element will be reflected in this
		 * element.
		 */
		isLinked: function(elem)
		{
			for(elemID in _design.elems)
			{
				var otherElem = _design.elems[elemID];
				if(otherElem.link && otherElem.link.id == elem.id)
				{
					return true;
				}
			}
			return false;
		},

		/*
		 * The design definition can contain 'links'. If one
		 * item is linked to another then changes to one shape
		 * will be reflected in the other. You can set a mirror
		 * property so that one element will be a mirror image of the 
		 * other.
		 */
		linkElems: function(elemID, linkProperties)
		{
			var elemIndex = _elemIDToIndex[elemID];
			var elem = _design.elems[elemIndex];
			
			elem.link = linkProperties;
			
			var linkedIndex = _elemIDToIndex[linkProperties.id];
			var linkElem = _design.elems[linkedIndex];
			
			this.cloneLinked(elem, linkProperties, linkElem);
			
			initLineUI(linkElem);
			initPatternUI(linkElem);
			
			$('.dragger').removeAttr('id').hide();
			$('.editlinecheck').attr('checked', false);
		},
		
		/*
		 * Remove the link between two elements so that they may be
		 * edited independently.
		 */
		unlinkElems: function(elemID)
		{
			var elemIndex = _elemIDToIndex[elemID];
			var elem = _design.elems[elemIndex];

			if(elem.link)
			{
				var linkedIndex = _elemIDToIndex[elem.link.id];
				var linkedElem = _design.elems[linkedIndex]
				initLineUI(linkedElem);

				delete elem.link;
			}
		},
		
		/*
		 * When you link two elements together, you will want the new one
		 * to immediately take the appearance of the other. This function
		 * does that.
		 */
		cloneLinked: function(obj, linkProperties, linkElem) {
			
			if (obj instanceof Array) {
				var len = obj.length;

				for (var i = 0; i < len; ++i) {
					if (null == obj[i] || "object" != typeof obj[i])
					{
						linkElem[i] = obj[i];	
					}
					else
					{
						var currentLinkProperty = null;
						if(linkProperties) currentLinkProperty = linkProperties[i];

						this.cloneLinked(obj[i], currentLinkProperty, linkElem[i]);	
					}
				}
				return;
			}

			if (typeof obj == 'object') {
				for (var attr in obj) {
					if (obj.hasOwnProperty(attr)) 
					{
						var currentLinkProperty = null;
						if(linkProperties) currentLinkProperty = linkProperties[attr];
								
						if(attr == 'id')
						{
							linkElem[attr] = linkProperties.id;
						}
						else if(attr == 'drawn')
						{
							linkElem[attr] = false;
						}
						else if(attr == 'controller')
						{
							if(linkElem[attr])
							{
								delete linkElem[attr];	
							}
						}
						else if(attr == 'link' || currentLinkProperty == 'nolink')
						{
							
						}
						else
						{
							if (null == obj[attr] || "object" != typeof obj[attr])
							{
								if(currentLinkProperty == 'reverse')
								{
									linkElem[attr] = 1 - obj[attr];	
								}
								else
								{
									linkElem[attr] = obj[attr];
								}
							}
							else
							{
								if(attr == 'lines')
								{
									for(lineIndex in linkElem[attr])
									{
										if(!obj[attr][lineIndex])
										{
											delete linkElem[attr][lineIndex];
										}
									}
								}
								this.cloneLinked(obj[attr], currentLinkProperty, linkElem[attr], linkProperties[attr]);		
							}
						}
					}
				}
				return;
			}

			throw new Error("Unable to copy obj! Its type isn't supported.");
		},

		/**
		 * Create a new line and add it to an element of the design.
		 */
		addLine: function(selectorID)
		{
			var selectorParts = selectorID.split('-');	
			
			if(selectorParts.length > 3)
			{
				var elemID = selectorParts[0];
				var elemIndex = _elemIDToIndex[elemID];
				var lineIndex = selectorParts[2];
				var elem = _design.elems[elemIndex];
				
				var currentLineData = elem['lines'][lineIndex];
				
				if(!currentLineData)
				{
					elem['lines'][lineIndex] = {
						rotation: 0,
						xStart: 0,
						yStart: 0,
						xEnd: 1,
						yEnd: 1,
						colour: '#999',
						widthStart: 0.05,
						widthEnd: 0.05,
						curveType: 'straight',
						xCurve: 0.5,
						yCurve: 0.5,
						mirror: false,
						editing: true
					}
					
					var lineID = elem.id + '-lines-' + lineIndex;
					dragListeners[lineID] = elem['lines'][lineIndex];
				}
				
				if(elem.link)
				{
					var elemLink = elem.link;
					var linkID = elemLink.id;
					
					if(elemLink["lines"])
					{
						var linkIndex = _elemIDToIndex[linkID];
						var linkElem = _design.elems[linkIndex];
						
						linkElem['lines'][lineIndex] = {
							rotation: 0,
							xStart: 0,
							yStart: 0,
							xEnd: 1,
							yEnd: 1,
							colour: '#999',
							widthStart: 0.05,
							widthEnd: 0.05,
							curveType: 'straight',
							xCurve: 0.5,
							yCurve: 0.5,
							mirror: false,
							editing: true
						}
						
						this.setLinkedPropertyValue(elem, [elemID, 'lines', lineIndex, 'xStart'], 0);
						this.setLinkedPropertyValue(elem, [elemID, 'lines', lineIndex, 'xEnd'], 1);
						
						initLineUI(linkElem);
						
						var lineID = linkElem.id + '-lines-' + lineIndex;
						dragListeners[lineID] = linkElem['lines'][lineIndex];
					}
				}
			}
			
			initLineUI(_design.elems[elemIndex]);
			this.drawDesign();
			this.changeLine(selectorID);
		},
		
		/**
		 * This function looks pretty daft.
		 */
		retrieveByArray: function(obj, arrayIndexes) {
			var currentVal = obj;
			for(var i = 0; i < arrayIndexes.length; i++)
			{
				currentVal = currentVal[arrayIndexes[i]];
				break;
			}
			return currentVal;
		},
		
		/**
		 * If an element is linked to another element in the design, this
		 * function will update an aspect of the linked element when the
		 * othe is changed. 
		 */
		setLinkedPropertyValue: function(elem, selectorParts, value) {
			var indexer = selectorParts.slice(1, selectorParts.length - 1);
			var indexAttr = selectorParts[selectorParts.length - 1];
			
			if(elem.link)
			{				
				var elemLink = elem.link;
				var linkID = elemLink.id;
				
				var linkIndex = _elemIDToIndex[linkID];
				var linkedElem = _design.elems[linkIndex];

				var linkedAttrs = this.retrieveByArray(elem.link, indexer);

				var linkType = linkedAttrs[indexAttr];

				var linkedSelectorParts = selectorParts.slice(0, selectorParts.length);
				linkedSelectorParts[0] = linkID;

				switch(linkType)
				{
					case 'nolink':
						break;
					case 'reverse':
						this.setPropertyValue(linkedElem, linkedSelectorParts, 1 - value);
						break;
					default:
						this.setPropertyValue(linkedElem, linkedSelectorParts, value);
						break;
				}
			}
		},
		
		/**
		 * Set an element property using a selector.
		 *
		 * @param elem The design element to change.
		 * @param selectorParts An array the walks through the object keys.
		 * @param value The value to set the found property to.
		 */
		setPropertyValue: function(elem, selectorParts, value) {
			var propertyL1 = selectorParts[1];

			if(selectorParts[1] == 'pattern')
			{
				elem.pattern.drawn = false;
			}

			if(selectorParts.length == 2)
			{
				elem[propertyL1] = value;
			}
			else if(selectorParts.length == 3)
			{
				var propertyL2 = selectorParts[2];
				elem[propertyL1][propertyL2] = value;
			}
			else if(selectorParts.length == 4)
			{
				var propertyL2 = selectorParts[2];
				var propertyL3 = selectorParts[3];
				elem[propertyL1][propertyL2][propertyL3] = value;
			}
		},
		
		/**
		 * Change a property of the design.
		 * Update any linked elements to reflect this.
		 * Reset the line controllers if there are any attached.
		 */
		setProperty: function(selectorID, value, dontRedraw) {
			var selectorParts = selectorID.split('-');
			
			var elemID = selectorParts[0];
			
			var elem = null;
			for(var i = 0; i < _design.elems.length; i++) {
				if(_design.elems[i].id == elemID) {
					elem = _design.elems[i];
					break;
				}
			}
			
			if(elem)
			{				
				this.setPropertyValue(elem, selectorParts, value);
				
				if(elem.link)
				{					
					this.setLinkedPropertyValue(elem, selectorParts, value);
				}
				
				if(selectorParts[1] == 'lines')
				{
					var line = elem[selectorParts[1]][selectorParts[2]];
					line['drawn'] = false;
					
					if(elem.link)
					{					
						this.setLinkedPropertyValue(elem, [elemID, 'lines', selectorParts[2], 'drawn'], false);
					}
					
					this.setupLineControllers(selectorID);
				}
			}
			
			if(!dontRedraw)
			{
				this.drawDesign();	
			}
		},
		
		/**
		 * Loop through the shapes and call drawShape to do the
		 * magic.
		 */
		drawDesign: function() {
			this.clear();
			
			for(var i = 0; i < _design.elems.length; i++) {
				var id = _design.elems[i].id;
				 
				this.drawShape(_shapes[id]); 
			}
		},
		
		/**
		 * Accessor to get the current design. If you change it
		 * directly then bad things will happen.
		 */
		getDesign: function() {
			return _design;
		},
		
		/**
		 * The clever stuff. This will draw one element of the
		 * design.
		 *
		 * Sets up a fill style (solid or pattern). Calls drawPath
		 * to draw the actual shape. Draws some text upon it if you like.
		 * Applys any texture over it.
		 *
		 * @param shape The shape to draw. shape is an object that was
		 *              created using the 'shape' function.
		 *
		 */ 
		drawShape: function(shape) {						
			var shapeIndex = _elemIDToIndex[shape.getID()];
			var shapeProperties = _design.elems[shapeIndex];
			var texture = shape.getTexture();
			var fill = false;

			if(shape.getPattern())
			{				
				ctx.fillStyle = this.drawPattern(shape);
				fill = true;
			}
			else 
			{
				if(shapeProperties.fillStyle)
				{
					ctx.fillStyle = shapeProperties.fillStyle;
					fill = true;
				}
			}
			
			this.drawPath(shape);
			if(fill)
			{
				ctx.fill();	
			}
			
			if(shape.getLineWidth())
			{
				ctx.stroke();	
			}
			
			if(shapeProperties.text)
			{
				this.drawText(shapeProperties.text);
			}
			
			if(texture && _textures[texture] && !this.editingLine(shape))
			{
				this.applyTexture(shape);
			}
		},
		
		/**
		 * Simple function to draw text on top of the design.
		 */
		drawText: function(textProperties) {
			ctx.fillStyle = textProperties.fillStyle;
			ctx.font = textProperties.font;
			ctx.textAlign = textProperties.textAlign;
			ctx.textBaseline = textProperties.textBaseline;
			ctx.fillText  (textProperties.text, _width / 2, _height / 2);
		},
		
		/**
		 * Checks if any line of a particular shape in the design is 
		 * currently being edited.
		 */
		editingLine: function(shape) {
			var lines = shape.getLines();

			for(var i in lines)
			{
				var line = lines[i];
				if(line && 'controller' in line)
				{
					var startControl = line['controller']['Start'];
					var endControl = line['controller']['End'];
					var curveControl = line['controller']['Curve'];
						
					if(startControl.moving || endControl.moving || curveControl.moving) 
					{
						return true;
					}
				}
			}
			return false;
		},
		
		/**
		 * Loops through the points of the design and draws the lines. It 
		 * applys the styles and any curve you have specified.
		 *
		 * You can give points a radius if you want to draw arcs or circles.
		 */
		drawPath: function(shape)
		{
			shape.scale(_width, _height);
			//shape.move(offsetLeft, offsetTop);
			
			var firstPoint = shape.getPoint(0);
			
			if(firstPoint.radius)
			{
				ctx.beginPath();
				ctx.strokeStyle = shape.getStrokeStyle();
				ctx.lineWidth = shape.getLineWidth(_width);
				ctx.arc(firstPoint.x, firstPoint.y, firstPoint.radius, firstPoint.startAngle, firstPoint.endAngle, false);
			}
			else
			{
				var shapeRect = shape.getBoundingRect();
				var shapeWidth = shapeRect.width;

				ctx.lineJoin = shape.getLineJoin();;
				ctx.strokeStyle = shape.getStrokeStyle();
				ctx.lineWidth = shape.getLineWidth(_width);// * shapeWidth;
				ctx.beginPath();

				var firstPoint = shape.getPoint(0);
				var firstCurve = shape.getCurve(0);
				ctx.moveTo(firstPoint.x, firstPoint.y);

				for(var i = 1; i < shape.numPoints(); i++) {				
					var point = shape.getPoint(i);
					var curve = shape.getCurve(i);

					if(curve)
					{
						ctx.quadraticCurveTo(curve.x, curve.y, point.x, point.y);
					}
					else
					{
						ctx.lineTo(point.x, point.y);	
					}
				}

				if(firstCurve)
				{
					ctx.quadraticCurveTo(firstCurve.x, firstCurve.y, firstPoint.x, firstPoint.y);
				}
				else
				{
					ctx.lineTo(firstPoint.x, firstPoint.y);				
				}	
				
				ctx.closePath();
			}
		},
		
		/**
		 * Draws a pattern (currently shapes or squares).
		 *
		 * The pattern can be rotated.
		 *
		 * It creates tiles from your definition of the pattern and
		 * sets these as the pattern for a temporary canvas. The 
		 * temp canvas is cached so it can be easily be used as the 
		 * fill for your shape element later.
		 */
		drawPattern: function(shape) {
			var shapeRect = shape.getBoundingRect();
			var shapeCentreX = shapeRect.x + (shapeRect.width / 2);
			var shapeCentreY = shapeRect.y + (shapeRect.height / 2);
			var shapeWidth = shapeRect.width;
			
			var pattern = shape.getPattern();
			var patternCacheID = pattern.id + 'pattern';
			
			if(!_canvasCache[patternCacheID] || !pattern.drawn)
			{
				if(pattern.type == 'stripes')
				{
					var pTotal = (pattern.width1 + pattern.width2 + (pattern.width3 * 2));
					
					shapeWidth = shapeWidth * pattern.size;
					var p1ShapeWidth = (pattern.width1 / pTotal) * shapeWidth;
					var p2ShapeWidth = (pattern.width2 / pTotal) * shapeWidth;
					var p3ShapeWidth = (pattern.width3 / pTotal) * shapeWidth;

					var pSize = (p1ShapeWidth + p2ShapeWidth + (p3ShapeWidth * 2));
				}
				else if(pattern.type == 'squares')
				{
					var pSize = shapeRect.width * pattern.size * 2;
				}
				else
				{
					var pSize = pattern.size * shapeWidth;
				}

			
				var tileCanvas = document.createElement('canvas');
				tileCanvas.width = pSize;
				tileCanvas.height = pSize;
				var tileCtx = tileCanvas.getContext('2d');
			
				if(pattern.type == 'squares')
				{					
					tileCtx.fillStyle = pattern.colour1;
					tileCtx.fillRect(0, 0, pSize / 2, pSize / 2);
					tileCtx.fillStyle = pattern.colour2;
					tileCtx.fillRect(pSize / 2, 0, pSize / 2, pSize / 2);
					tileCtx.fillStyle = pattern.colour2;
					tileCtx.fillRect(0, pSize / 2, pSize / 2, pSize / 2);
					tileCtx.fillStyle = pattern.colour1;
					tileCtx.fillRect(pSize / 2, pSize / 2, pSize / 2, pSize / 2);	
				}
				else if(pattern.type == 'stripes')
				{					
					tileCtx.fillStyle = pattern.colour3;
					tileCtx.fillRect(0, 0, p3ShapeWidth, pSize);
					tileCtx.fillStyle = pattern.colour1;
					tileCtx.fillRect(p3ShapeWidth, 0, p1ShapeWidth, pSize);
					tileCtx.fillStyle = pattern.colour3;
					tileCtx.fillRect(p3ShapeWidth + p1ShapeWidth, 0, p3ShapeWidth, pSize);
					tileCtx.fillStyle = pattern.colour2;
					tileCtx.fillRect((p3ShapeWidth * 2) + p1ShapeWidth, 0, p2ShapeWidth, pSize);
				}
				else
				{
					tileCtx.fillStyle = pattern.colour1;
					tileCtx.fillRect(0, 0, pSize, pSize);
				}

				var patternCanvas = this.createCanvas(_width, _height);
				var patternCtx = this.createCtx(patternCanvas, _width, _height);
				var patternFill = patternCtx.createPattern(tileCanvas, 'repeat');

				patternCtx.save();
				patternCtx.fillStyle = patternFill;
				if(shape.getID() == 'shirt')
				{
					patternCtx.translate(shapeCentreX + 10, shapeCentreY + 10);
				}
				else
				{
					patternCtx.translate(shapeCentreX, shapeCentreY);
				}

				patternCtx.rotate(pattern.rotation * Math.PI);
				patternCtx.translate(-(_width), -(_height));
				patternCtx.beginPath();
				patternCtx.rect(0, 0,_width * 2, _height * 2);
				patternCtx.closePath();
				patternCtx.fill();
				patternCtx.restore();
				
				_canvasCache[patternCacheID] = {canvas: patternCanvas, ctx: patternCtx};
				pattern.drawn = 1;
			}
			else
			{
				var patternCanvas = _canvasCache[patternCacheID].canvas;
				var patternCtx = _canvasCache[patternCacheID].ctx;
			}
			
			var linesCanvas = this.createCanvas(_width, _height);
			var linesCtx = this.createCtx(linesCanvas, _width, _height);
			
			var bCanvas = this.createCanvas(_width, _height);
			var bCtx = this.createCtx(bCanvas, _width, _height);
			
			bCtx.drawImage(patternCanvas, 0, 0, _width, _height);

			this.drawLines(bCtx, shape);

			var bPattern = ctx.createPattern(bCanvas, 'no-repeat');
			
			return bPattern;
		},
		
		createCanvas: function(width, height) {
			var cCanvas = document.createElement('canvas');
			cCanvas.width = _width;
			cCanvas.height = _height;
			return cCanvas;
		},
		
		createCtx: function(canvas, width, height) {
			var cCtx = canvas.getContext('2d');
			cCtx.width = _width;
			cCtx.height = _height;
			return cCtx;
		},
		
		screenPosToCanvasPos: function(x, y)
		{
			return {
				'x': x - $(_canvas).position().left,
				'y': y - $(_canvas).position().top
			};
		},
		
		shapePosToScreenPos: function(shape, x, y)
		{
			var shapeRect = shape.getBoundingRect();

			var screenX = $(_canvas).position().left + shapeRect.x + (x * shapeRect.width);
			var screenY = $(_canvas).position().top + shapeRect.y + (y * shapeRect.height);
			
			return {'x': screenX, 'y': screenY, 'left': screenX, 'top': screenY};
		},
		
		shapePosToCanvasPos: function(shape, x, y)
		{
			var shapeRect = shape.getBoundingRect();

			var screenX = shapeRect.x + (x * shapeRect.width);
			var screenY = shapeRect.y + (y * shapeRect.height);
			
			return {'x': screenX, 'y': screenY, 'left': screenX, 'top': screenY};
		},
		
		screenPosToShapePos: function(shape, x, y)
		{
			var shapeRect = shape.getBoundingRect();
			
			return {
				'x': (x - shapeRect.x - $(_canvas).position().left) / shapeRect.width,
				'y': (y - shapeRect.y - $(_canvas).position().top) / shapeRect.height
			};
		},
		
		setupLineControllers: function(selector)
		{
			var selectorParts = selector.split('-');
			var shape = _shapes[selectorParts[0]];
			
			var lines = shape.getLines();
			
			if(lines && lines.length)
			{
				var i = selectorParts[2];
				var line = lines[i]; 
				
				setUpDraggers(shape.id);

				var $startControl = $('#' + shape.getID() + '-lines-'+ i + '-Start');
				var $endControl = $('#' + shape.getID() + '-lines-'+ i + '-End');
				var $curveControl = $('#' + shape.getID() + '-lines-'+ i + '-Curve');

				var lineStartPos = this.shapePosToScreenPos(shape, line.xStart, line.yStart);
				var lineEndPos = this.shapePosToScreenPos(shape, line.xEnd, line.yEnd);
				var lineCurve = this.shapePosToScreenPos(shape, line.xCurve, line.yCurve);

				this.moveDragger($startControl, lineStartPos);
				this.moveDragger($endControl, lineEndPos);
				
				if(line['curveType'] == 'straight')
				{
					$curveControl.hide();
				}
				else
				{
					if($startControl.css('display') == 'block')
					{
						$curveControl.show();
						this.moveDragger($curveControl, lineCurve);	
					}
				}

				line['controller'] = {
					'Start': {'x': lineStartPos.x, 'y': lineStartPos.y, 'moving': 0, 'dropping': 0},
					'End': {'x': lineEndPos.x, 'y': lineEndPos.y, 'moving': 0, 'dropping': 0},
					'Curve': {'x': lineCurve.x, 'y': lineCurve.y, 'moving': 0, 'dropping': 0}
				}
			}
		},
		
		moveDragger: function($dragger, pos) {
			var newLeft = pos.left - $dragger.width() / 2;
			var newTop = pos.top - $dragger.height() / 2;
			$dragger.offset({'left': newLeft, 'top': newTop});
		},
		
		snapPointToGrid: function(point, shapeRect)
		{
			var gridLines = 14;
			var gridWidth = shapeRect.width / gridLines;
			var gridHeight = shapeRect.height / gridLines;	
			
			point.x = shapeRect.x + (Math.round((point.x - shapeRect.x) / gridWidth) * gridWidth);
			point.y = shapeRect.y + (Math.round((point.y - shapeRect.y) / gridHeight) * gridHeight);
			return point;
		},
		
		drawLines: function(fillCtx, shape)
		{			
			var lines = shape.getLines();
			
			if(lines && lines.length)
			{			
				var shapeRect = shape.getBoundingRect();
				var shapeCentreX = shapeRect.x + (shapeRect.width / 2);
				var shapeCentreY = shapeRect.y + (shapeRect.height / 2);

				var editingLine = false;
				var dropping = false;
				
				var shapeID = shape.getID();
				var elemIndex = _elemIDToIndex[shapeID];
				
				for(var i in lines)
				{
					var line = lines[i];
					
					if(line && 'controller' in line) 
					{
						var startControl = line['controller']['Start'];
						var endControl = line['controller']['End'];
						var curveControl = line['controller']['Curve'];

						if(startControl.moving || endControl.moving || curveControl.moving) 
						{
							editingLine = true;

							var newLineStart = this.screenPosToShapePos(shape, startControl.x, startControl.y);
							var newLineEnd = this.screenPosToShapePos(shape, endControl.x, endControl.y);
							var newLineCurve = this.screenPosToShapePos(shape, curveControl.x, curveControl.y);

							line.xStart = newLineStart.x;
							line.yStart = newLineStart.y;
							line.xEnd = newLineEnd.x;
							line.yEnd = newLineEnd.y;
							line.xCurve = newLineCurve.x;
							line.yCurve = newLineCurve.y;
							line['drawn'] = false;
							
							if(_design.elems[elemIndex].link)
							{
								var designElem = _design.elems[elemIndex];
								var elemLink = designElem.link;

								if(elemLink["lines"])
								{
									this.setLinkedPropertyValue(designElem, [shapeID, 'lines', i, 'xStart'], newLineStart.x);
									this.setLinkedPropertyValue(designElem, [shapeID, 'lines', i, 'yStart'], newLineStart.y);
									this.setLinkedPropertyValue(designElem, [shapeID, 'lines', i, 'xEnd'], newLineEnd.x);
									this.setLinkedPropertyValue(designElem, [shapeID, 'lines', i, 'yEnd'], newLineEnd.y);
									this.setLinkedPropertyValue(designElem, [shapeID, 'lines', i, 'xCurve'], newLineCurve.x);
									this.setLinkedPropertyValue(designElem, [shapeID, 'lines', i, 'yCurve'], newLineCurve.y);
									this.setLinkedPropertyValue(designElem, [shapeID, 'lines', i, 'drawn'], false);
								}
							}
							
							for(end in line['controller']) {
								if(line['controller'][end].dropping)
								{
									line['controller'][end].moving = 0;
									line['controller'][end].dropping = 0;
									dropping = true;
								}
							}
						}
					}
				}
				
				for(var i in lines)
				{
					var lineID = shape.getID() + '-lines-' + i;
					var line = lines[i];
					
					if(line)
					{
						var newCanvas = false;
						if(!_canvasCache[lineID])
						{
							var lineCanvas = this.createCanvas(fillCtx.width, fillCtx.height);
							var lineCtx = this.createCtx(lineCanvas, fillCtx.width, fillCtx.height)
							_canvasCache[lineID] = {'canvas': lineCanvas, 'ctx': lineCtx};	
							newCanvas = true;
						}
						else
						{
							var lineCanvas = _canvasCache[lineID].canvas;
							var lineCtx = _canvasCache[lineID].ctx;
						}

						if(!line.drawn || newCanvas)
						{
							lineCtx.clearRect(0, 0, lineCanvas.width, lineCanvas.height);	

							lineCtx.strokeStyle = line.colour;
							lineCtx.fillStyle = line.colour;
							if(line.widthStart <= 1 && line.widthEnd <= 1)
							{
								lineCtx.lineWidth = line.widthStart * shapeRect.width;						
							}

							lineCtx.beginPath();

							var start = this.shapePosToCanvasPos(shape, line.xStart, line.yStart);
							var end = this.shapePosToCanvasPos(shape, line.xEnd, line.yEnd);
							var curve = this.shapePosToCanvasPos(shape, line.xCurve, line.yCurve);

							if(editingLine)
							{						
								start = this.snapPointToGrid(start, shapeRect);
								end = this.snapPointToGrid(end, shapeRect);
								curve = this.snapPointToGrid(curve, shapeRect);
							}

							this.drawRectLine(lineCtx, shapeRect, line, start, end, curve); 

							if(line.mirror)
							{
								this.drawRectLine(lineCtx, shapeRect, line,
									this.mirrorXPoint(start, shapeCentreX),
									this.mirrorXPoint(end, shapeCentreX),
									this.mirrorXPoint(curve, shapeCentreX)
								); 
							}
						}
						fillCtx.drawImage(lineCanvas, 0, 0, lineCanvas.width, lineCanvas.height);	

						line.drawn = true;
					}
				}
				
				if(editingLine && !dropping)
				{
					this.drawGrid(fillCtx, shape, 'cross');	
				}
			}
		},
		
		mirrorXPoint: function(point, mirrorX) {
			return {'x': (mirrorX - point.x) + mirrorX, 'y': point.y};
		},
		
		drawRectLine: function(fillCtx, shapeRect, line, start, end, curve) {
			var startWidth = line.widthStart * shapeRect.height;
			var endWidth = line.widthEnd * shapeRect.height;
			
			var vecx = end.x - start.x;
			var vecy = end.y - start.y;
			
			var startVec = vector2d(vecx, vecy);
			startVec.normalize();
			startVec.rotate(Math.PI / 2);
			startVec.scale(startWidth / 2);
			
			var endVec = vector2d(vecx, vecy);
			endVec.normalize();
			endVec.rotate(Math.PI / 2);
			endVec.scale(endWidth / 2);
			
			var startPoint = vector2d(start.x, start.y);
			var endPoint = vector2d(end.x, end.y);
			
			var point1 = vector2d(start.x, start.y);
			point1.add(startVec);
			var point2 = vector2d(end.x, end.y);
			point2.add(endVec);
			var point3 = vector2d(end.x, end.y);
			point3.sub(endVec)
			var point4 = vector2d(start.x, start.y);
			point4.sub(startVec);
			
			if(line.curveType == 'straight')
			{
				fillCtx.moveTo(point1.vx, point1.vy);
				fillCtx.lineTo(point2.vx, point2.vy);
				fillCtx.lineTo(point3.vx, point3.vy);
				fillCtx.lineTo(point4.vx, point4.vy);
			}
			else if(line.curveType == 'curve' || line.curveType == 'angle')
			{
				var curvePointVec = vector2d(curve.x - start.x, curve.y - start.y);
				var lenToCurvePoint = curvePointVec.length();
				var dirToCurvePoint = curvePointVec.direction();
				var lineVec = vector2d(vecx, vecy);
				var dirToEndPoint = lineVec.direction();
				var angleToCurvePoint = dirToCurvePoint - dirToEndPoint;
				
				var lenToIntersect = Math.cos(angleToCurvePoint) * lenToCurvePoint;
				
				var amountDownLine = lenToIntersect / lineVec.length();
				var widthAtIntersect = startWidth * amountDownLine + endWidth * (1 - amountDownLine);
				
				linceVec.normalize();
				lineVec.rotate(Math.PI / 2);
				lineVec.scale(widthAtIntersect / 2);
				
				var curvePoint1 = vector2d(curve.x, curve.y);
				curvePoint1.add(lineVec);

				var curvePoint2 = vector2d(curve.x, curve.y);
				curvePoint2.sub(lineVec);
				
				if(line.curveType == 'curve')
				{					
					fillCtx.moveTo(point1.vx, point1.vy);
					fillCtx.quadraticCurveTo(curvePoint1.vx, curvePoint1.vy, point2.vx, point2.vy);
					fillCtx.lineTo(point3.vx, point3.vy);
					fillCtx.quadraticCurveTo(curvePoint2.vx, curvePoint2.vy, point4.vx, point4.vy);
				}
				else if(line.curveType == 'angle')
				{
					fillCtx.moveTo(point1.vx, point1.vy);
					fillCtx.lineTo(curvePoint1.vx, curvePoint1.vy);
					fillCtx.lineTo(point2.vx, point2.vy);
					fillCtx.lineTo(point3.vx, point3.vy);
					fillCtx.lineTo(curvePoint2.vx, curvePoint2.vy);	
					fillCtx.lineTo(point4.vx, point4.vy);
				}
			}

			
			fillCtx.closePath();
			fillCtx.fill();
		},
		
		drawGrid: function(fillCtx, shape, type)
		{			
			var lines = shape.getLines();
			
			if(lines && lines.length)
			{
				var gridID = shape.getID() + '-grid';

				var newCanvas = false;
				if(!_canvasCache[gridID])
				{
					var gridCanvas = this.createCanvas(fillCtx.width, fillCtx.height);
					var gridCtx = this.createCtx(gridCanvas, fillCtx.width, fillCtx.height)
					_canvasCache[gridID] = {'canvas': gridCanvas, 'ctx': gridCtx};	
					newCanvas = true;
				}
				else
				{
					var gridCanvas = _canvasCache[gridID].canvas;
					var gridCtx = _canvasCache[gridID].ctx;
				}
				
				if(newCanvas)
				{
					var shapeRect = shape.getBoundingRect();

					var gridLines = 14;
					var gridWidth = shapeRect.width / gridLines;
					var gridHeight = shapeRect.height / gridLines;

					gridCtx.beginPath();
					gridCtx.strokeStyle = '#eee';
					gridCtx.lineWidth = 1;
					if(type == 'line')
					{
						for(var x = 0; x < shapeRect.width; x += gridWidth)
						{
							gridCtx.moveTo(shapeRect.x + x, shapeRect.y);
							gridCtx.lineTo(shapeRect.x + x, shapeRect.x + shapeRect.height);				
						}
						for(var y = 0; y < shapeRect.height; y += gridHeight)
						{
							gridCtx.moveTo(shapeRect.x, shapeRect.y + y);
							gridCtx.lineTo(shapeRect.x + shapeRect.width, shapeRect.y + y);				
						}
					}
					else if(type == 'cross')
					{
						for(var x = 0; x < shapeRect.width; x += gridWidth)
						{
							for(var y = 0; y < shapeRect.height; y += gridHeight)
							{
								this.drawCrosshair(
									gridCtx,
									shapeRect.x + x, 
									shapeRect.y + y,
									1
								);
							}				
						}
					}

					gridCtx.stroke();	
				}

				fillCtx.drawImage(gridCanvas, 0, 0, gridCanvas.width, gridCanvas.height);

			}
		},
		
		drawCrosshair: function(fillCtx, x, y, size)
		{			
			fillCtx.moveTo(x, y - size);
			fillCtx.lineTo(x, y + size);
			fillCtx.moveTo(x - size, y);
			fillCtx.lineTo(x + size, y);
		},
		
		applyTexture: function(shape) 
		{			
			var texid = shape.getTexture();
			var shapeBounds = shape.getBoundingRect();
			var left = shapeBounds.x;
			var top = shapeBounds.y;
			var width = shapeBounds.width;
			var height = shapeBounds.height;
			
			var image = _textures[texid];
			
			if(_canvasCache['texturePattern'])
			{
				patternCanvas = _canvasCache['texturePattern'];
			}
			else
			{
				var patternCanvas = document.createElement('canvas');
				patternCanvas.width = image.width;
				patternCanvas.height = image.height;
				_canvasCache['texturePattern'] = patternCanvas;
			}

			var patternCtx = patternCanvas.getContext('2d'); 
			
			if(_canvasCache['textureComposite'])
			{
				compositeCanvas = _canvasCache['textureComposite'];
			}
			else
			{
				var compositeCanvas = document.createElement('canvas');
				compositeCanvas.width = _width;
				compositeCanvas.height = _height;	
				_canvasCache['textureComposite'] = patternCanvas;
			}

			var compositeCtx = compositeCanvas.getContext('2d');

			patternCtx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
			var canvasData = ctx.getImageData(left,top,width,height);
			var compositeData = compositeCtx.getImageData(0,0,width,height);
			var patternData = patternCtx.getImageData(0,0,width,height);
			
			for(var y = 0; y < height; y++)
			{
				for(var x = 0; x < width; x++)
				{					
					var pix = this.getPixel(canvasData, x, y);
					var oPix = this.getPixel(patternData, x, y);
					
					var rAdj = oPix.r / 255.0;
					var gAdj = oPix.g / 255.0;
					var bAdj = oPix.b / 255.0;

					this.setPixel(compositeData, x, y, pix.r * rAdj, pix.g * gAdj, pix.b * bAdj, 255); 
				}
			}

			compositeCtx.putImageData(compositeData, left, top);
			
			var pattern = ctx.createPattern(compositeCanvas, 'no-repeat'); 

			ctx.fillStyle = pattern;
			
			this.drawPath(shape);

			ctx.globalAlpha = 1;
			ctx.fill();
		},
		
		getPixel: function(imageData, x, y) {
			var pixelIndex = (imageData.width * y + x) * 4;
			
			return {
				r: imageData.data[pixelIndex],
				g: imageData.data[pixelIndex + 1],
				
				b: imageData.data[pixelIndex + 2],
				a: imageData.data[pixelIndex + 3]
			};
		},
		
		setPixel: function(imageData, x, y, r, g, b, a) {
			var index = (x + y * imageData.width) * 4;
			imageData.data[index+0] = r;
			imageData.data[index+1] = g;
			imageData.data[index+2] = b;
			imageData.data[index+3] = a;
		},
		
		getDesignData: function() {
			var designJSON = JSON.stringify(_design);
			var tempDesign = JSON.parse(designJSON);
			var elem = null;
			
			for(var i = 0; i < tempDesign.elems.length; i++)
			{
				elem = tempDesign.elems[i];
				
				if(elem.lines && elem.lines.length)
				{
					for(var lineIndex in elem.lines)
					{
						if(elem.lines[lineIndex])
						{
							if(elem.lines[lineIndex].hasOwnProperty('controller'))
							{
								delete elem.lines[lineIndex]['controller'];
							}
							if(elem.lines[lineIndex].hasOwnProperty('drawn'))
							{
								delete elem.lines[lineIndex]['drawn'];
							}
							if(elem.lines[lineIndex].hasOwnProperty('editing'))
							{
								delete elem.lines[lineIndex]['editing'];
							} 
						}
					}
				}
				
				if(elem.pattern && elem.pattern.hasOwnProperty('drawn'))
				{
					delete elem.pattern['drawn'];
				}
			}
			
			var designDataJSON = JSON.stringify(tempDesign);
			
			console.log(designDataJSON);
			
			return designDataJSON;
		},
		
		save: function(url) {
			var canvasData = _canvas.toDataURL("image/png");
			
			var designDataJSON = this.getDesignData();
			
			$.ajax(
				'designer/design-ajax.php',
				{
					type: 'POST',
					data: {
						"action": "saveDesign",
						"data": canvasData,
						"design": designDataJSON
					},
					success: function(data) {
						var responseData = JSON.parse(data);
						
						if(responseData['success'])
						{
							
						}
						alert(responseData['msg']);
					}
				}
			);
		},
		
		getImageDataURL: function() {
			return _canvas.toDataURL("image/png");
		},
		
		copyImage: function(newCanvas, x, y) {
			if(!x) x = 0;
			if(!y) y = 0;
			
			var newCanvasCtx = newCanvas.getContext('2d');
			newCanvasCtx.drawImage(_canvas, x, y, _width, _height);
		}
	}
	
	return that;
}

/**
 * Creates an object representing one element of an editor2d
 * design.
 *
 * It handles converting the points in range 0 to 1 in the 
 * design to real coordinates.
 *
 * It has some helper functions for converting curves into
 * points that can be used on bezier curves.
 *
 * @param properties The definition of a single editor2d element.
 */
var shape = function(properties) {
	var _points = properties.points;
	if(!_points) _points = [];
	
	var _properties = properties;
	
	var scaledPoints = [];
	
	var _xScale = 1;
	var _yScale = 1;
	var _x = 0;
	var _y = 0;
	
	var _id = shape;
	
	var _pattern = null;
	var _lines = null;
	
	var _texture = null;

	var that = {		
		numPoints: function() {
			return _points.length;
		},
		
		getPoint: function(i) {
			var point = _points[i];
			var offsetX = _x * _xScale;
			var offsetY = _y * _yScale;
			
			var baseOffsetX = 0;
			var baseOffsetY = 0;
			if(_properties.offset)
			{
				baseOffsetX = _properties.offset.x * _xScale;
				baseOffsetY = _properties.offset.y * _yScale;	
			}
			
			var width = _properties.lineWidth;
			
			var pointProperties = {
				"x": point.x * _xScale + offsetX + baseOffsetX, 
				"y": point.y * _yScale + offsetY + baseOffsetY,
				"width": width
			};
			
			if(point.radius)
			{
				pointProperties["radius"] = point.radius * _xScale;
				if(point.startAngle)
				{
					pointProperties["startAngle"] = point.startAngle;
				}
				else
				{
					pointProperties["startAngle"] = 0;
				}
				if(point.endAngle)
				{
					pointProperties["endAngle"] = point.endAngle;
				}
				else
				{
					pointProperties["endAngle"] = 2 * Math.PI;
				}
			}
			
			return pointProperties
		},
		
		setID: function(id) {
			_id = id;
		},
		
		getID: function() {
			return _id;
		},
		
		getCurve: function(i) {
			var point = _points[i];
			var offsetX = _x * _xScale;
			var offsetY = _y * _yScale;
			
			if(point.curve)
			{
				
				var pointBeforeIndex = i - 1;
				if(i == 0) 
				{
					pointBeforeIndex = _points.length - 1; 
				}
				
				
				var pointBefore = _points[pointBeforeIndex];
				var vecx = point.x - pointBefore.x;
				var vecy = point.y - pointBefore.y;
				
				var midPointX = pointBefore.x + (vecx / 2);
				var midPointY = pointBefore.y + (vecy / 2);
				var midVec = vector2d(midPointX, midPointY);
				var vec = vector2d(vecx, vecy);
				
				vec.normalize();
				vec.rotate(Math.PI / 2);
				vec.scale(point.curve);
				
				vec.add(midVec);
				
				return {x: vec.vx * _xScale + offsetX, y: vec.vy * _yScale + offsetY};
			}
			else
			{
				return false;
			}
		},
		
		getFillStyle: function() {
			return _properties.fillStyle;
		},
				
		getStrokeStyle: function() {
			return _properties.strokeStyle;
		},
		
		getBoundingRect: function()
		{			
			var top =  100000000;
			var left = 100000000;
			var bottom = 0;
			var right = 0;
			var firstPoint = this.getPoint(0);
			
			if(firstPoint.radius)
			{
				left = firstPoint.x - firstPoint.radius;
				top = firstPoint.y - firstPoint.radius;
				width = firstPoint.radius * 2;
				height = firstPoint.radius * 2;
			}
			else
			{
				for(var i = 0; i < this.numPoints(); i++) {
					var point = this.getPoint(i);
					if(point.x < left)
					{
						left = point.x;
					}
					if(point.y < top)
					{
						top = point.y;
					}
					if(point.x > right)
					{
						right = point.x;
					}
					if(point.y > bottom)
					{
						bottom = point.y;
					}
				}

				var width = right - left;
				var height = bottom - top;
			}
			
			return {
				'x': left, 'y': top, 'width': width, 'height': height
			};
		},
		
		getLineWidth: function(canvasWidth) {
			var boundingRect = this.getBoundingRect();
			var lineWidth = _properties.lineWidth;
			
			switch(this.getLineWidthType())
			{
				case 'relshape':
					lineWidth = lineWidth * boundingRect.width;
					break;
				case 'relcanvas':
					lineWidth = lineWidth * canvasWidth;
					break;
			}
			return lineWidth;
		},
		
		/*
		 * 'relshape' - lineWidth * shapeWidth
		 * 'relcanvas' - lineWidth * canvasWidth
		 * 'px' - lineWidth = width in pixels
		 */
		getLineWidthType: function() {
			if(_properties.lineWidthType)
			{
				return _properties.lineWidthType;
			}
			else
			{
				return 'relshape';
			}
		},
		
		getLineJoin: function() {
			if(_properties.lineJoin)
			{
				return _properties.lineJoin;
			}
			else
			{
				return 'bevel';
			}
		},
		
		getProperties: function() {
			return _properties;
		},
		
		scale: function(xScale, yScale) {
			if(_properties.pointType == "px")
			{
				_xScale = 1;
				_yScale = 1;
			}
			else
			{
				_xScale = xScale;
				_yScale = yScale;	
			}
		},
		
		move: function(x, y) {
			_x = x / _xScale;
			_y = y / _yScale;
		},
		
		setPattern: function(pattern) {
			_pattern = pattern;
		},
		
		getPattern: function(pattern) {
			return _pattern;
		},
		
		setTexture: function(texture) {
			_texture = texture;
		},
		
		getTexture: function() {
			return _texture;
		},
		
		setLines: function(lines) {
			_lines = lines;
		},
		
		getLines: function(lines) {
			return _lines;
		}
	}
	
	return that;
}
