var loadImage = function($image, callback) {
	var src = $image.attr('src');
	$image.bind('load', function(evt) {
		$image.unbind('load');
		callback($image);
	}).each(function() {
		if($image[0].complete) {
			$image.trigger('load');
		}
	});
	
	if($.browser.webkit) {
		$image.attr('src', '');
	}
	$image.attr('src', src);
};

var imageGroupID = function(images, callback) {
	var _images = images;
	var _numLoaded = 0;
	
	for(var i = 0; i < images.length; i++)
	{
		if(!document.getElementById(_images[i]))
		{
			_numLoaded++;
			if(_numLoaded == _images.length)
			{
				callback();
			}
		}
		
		var image = $('#' + images[i]);
		loadImage(image, function () {
			_numLoaded++;
			if(_numLoaded == _images.length)
			{
				callback();
			}
		});	
	}
}

var imageGroupSrc = function(imgSources, callback, listener) {
	var images = {};
	var numLoaded = 0;
	var numImages = imgSources.length
	
	for(var i = 0; i < numImages; i++)
	{		
		var imgData = imgSources[i];
		var id = imgData.id;
		var src = imgData.src;

		images[id] = new Image();
        images[id].onload = function(){
            if (++numLoaded >= numImages) {
                callback(images);
            }
        };
        images[id].src = src;
	}
}

var vector2d = function(x, y) {
	
	var vec = {
		vx: x,
		vy: y,
		
		coords: function() {
			return {"vx": vec.vx, "vy": vec.vy};
		},
		
		scale: function(scale, makeNew) {
			if(!makeNew)
			{
				vec.vx *= scale;
				vec.vy *= scale;
			}
			else
			{
				return vector2d(vec.vx * scale, vec.vy * scale);	
			}
		},
		
		add: function(vec2, makeNew) {
			if(!makeNew)
			{
				vec.vx += vec2.vx;
				vec.vy += vec2.vy;	
			}
			else
			{
				return vector2d(vec.vx + vec2.vx, vec.vy + vec2.vy);	
			}
		},
		
		sub: function(vec2, makeNew) {
			if(!makeNew)
			{
				vec.vx -= vec2.vx;
				vec.vy -= vec2.vy;	
			}
			else
			{
				return vector2d(vec.vx - vec2.vx, vec.vy - vec2.vy);	
			}
		},
		
		resist: function(vec2) {
			if(vec.vx > 0) vec.vx -= vec2.vx;
			else if(vec.vx < 0) vec.vx += vec2.vx;

			if(vec.vy > 0) vec.vy -= vec2.vy;
			else if(vec.vy < 0) vec.vy += vec2.vy;
		},
		
		negate: function(makeNew) {
			if(!makeNew)
			{
				vec.vx = -vec.vx;
				vec.vy = -vec.vy;	
			}
			else
			{
				return vector2d(-vec.vx, -vec.vy);	
			}
		},
		
		length: function() {
			return Math.sqrt(vec.vx * vec.vx + vec.vy * vec.vy);
		},
		
		lengthSquared: function() {
			return vec.vx * vec.vx + vec.vy * vec.vy;
		},
		
		normalize: function(makeNew) {
			var len = Math.sqrt(vec.vx * vec.vx + vec.vy * vec.vy);
			
			if(!makeNew)
			{
				if(len) {
					vec.vx /= len;
					vec.vy /= len;
				}

				return len;				
			}
			else
			{
				if(len)
				{
					return vector2d(vec.vx /= len, vec.vy /= len);		
				}
				else
				{
					return vector2d(0, 0);
				}
			}
		},
		
		direction: function() {
			var absX = Math.abs(vec.vx);
			var absY = Math.abs(vec.vy);
			var direction = Math.atan(absY / absX);
			if(vec.vx < 0 && vec.vy < 0) direction = Math.PI + Math.abs(direction);
			else if(vec.vx < 0 ) direction = Math.PI - Math.abs(direction);
			else if(vec.vy < 0 ) direction = Math.PI * 2 - Math.abs(direction);
			
			return direction;
		},
		
		rotate: function(angle, makeNew) {
			var vx = vec.vx;
			var vy = vec.vy;
			
			var cosVal = Math.cos(angle);
			var sinVal = Math.sin(angle);
			
			if(!makeNew)
			{
				vec.vx = vx * cosVal - vy * sinVal;
				vec.vy = vx * sinVal + vy * cosVal;	
			}
			else
			{
				return vector2d(vx * cosVal - vy * sinVal, vx * sinVal + vy * cosVal);	
			}
		},
		
		toString: function() {
			return '(' + vec.vx.toFixed(3) + ',' + vec.vy.toFixed(3) + ')';
		},
		
		radToDeg: function(angle) { 
			return (angle / (Math.PI * 2)) * 360;
		},

		degToRad: function(angle) {
			return (angle / 360) * (Math.PI * 2);
		},
		
		dot: function(vec2) {
			return vec.vx * vec2.vx + vec.vy * vec2.vy;
		},
		
		clone: function() {
			return vector2d(vec.vx, vec.vy);
		}
	};
	return vec;
}

var mikoGame = {
	KEY_LEFT_ARROW: 37,
	KEY_UP_ARROW: 38,
	KEY_RIGHT_ARROW: 39,
	KEY_DOWN_ARROW: 40,
	KEY_ENTER: 13,
	KEY_SPACE: 32,
	
	keyboardMonitor: function(properties)
	{
		var keyStates = {}
		for(var i = 0; i < properties['monitorKeys'].length; i++)
		{
			keyStates[properties['monitorKeys'][i]] = false;
		}

		var preventDefaultKeys = properties['preventDefaultKeys'];
		var keyDownCallback = properties['keyDownCallback'];
		var keyUpCallback = properties['keyUpCallback'];
		
		$(document).keydown(function(event) {
			if (preventDefaultKeys.indexOf(event.keyCode) != -1) {
				event.preventDefault();
			}

			if(keyStates.hasOwnProperty(event.keyCode))
			{	
				if(!keyStates[event.keyCode])
				{
					keyStates[event.keyCode] = true;
					keyDownCallback(event);	
				}
				event.preventDefault();
			}
		});

		$(document).keyup(function(event) {
			if (preventDefaultKeys.indexOf(event.keyCode) != -1) {
				event.preventDefault();
			}

			if(keyStates.hasOwnProperty(event.keyCode))
			{
				keyStates[event.keyCode] = false;
				keyUpCallback(event);
				event.preventDefault();
			}
		});
	},
	
	randRange: function(start, end, asFloat)
	{
		var range = Math.random() * (end - start + 1);
		if(!asFloat) range = Math.floor(range);
		return start + range;
	},
	
	clone: function(object) { 
		return jQuery.extend(true, {}, object);
	},
	
	/**
	Apply a selector in the form players-1-name will get the name from
	an assocArray = { 
		"players" : [
			...
			"1": {
				"name": "Wayne Rooney"
			}
		]
	}
	*/
	selectAssoc: function(assocArray, selector)
	{
		var tempItem = assocArray;

		selectorParts = selector.split('-');

		for(var i = 0; i < selectorParts.length; i++)
		{
			tempItem = tempItem[selectorParts[i]];
		}

		return tempItem;
	},
	
	sprite: function(properties, spriteSetup, stage) 
	{
		var displayObject = null;
		var spriteBounds = {"x": 0, "y": 0, "width": stage.canvas.width, "height": stage.canvas.height};
		var child = null;
		
		var that = {
			bounds: spriteBounds,
			width: spriteSetup.initial.width,
			halfWidth: spriteSetup.initial.width / 2,
			height: spriteSetup.initial.height,
			halfHeight: spriteSetup.initial.height / 2,
			
			initSprite: function()
			{
				var image = properties['image'];
				
				switch(spriteSetup.type)
				{
					case 'sprite':
						displayObject = new Bitmap(image);
						break;
					case 'spritesheet':
						spriteSheetData = mikoGame.clone(spriteSetup.spriteSheetData);
						spriteSheetData.images = [image];
						spriteSheet = new SpriteSheet(spriteSheetData);
						displayObject = new BitmapAnimation(spriteSheet);
						displayObject.gotoAndStop(0); 
						break;
					case 'clone':
						displayObject = spriteSetup['cloneBitmap'].clone();
						break;
				}
				
				stage.addChild(displayObject);
				
				this.initDisplayObject(displayObject, spriteSetup);
				
				spriteWidth = spriteSetup.initial.width;
				spriteHeight = spriteSetup.initial.height; 	
				stage.update();
			},
			
			clone: function()
			{				
				var clonedSetup = mikoGame.clone(spriteSetup);
				clonedSetup['type'] = 'clone';
				clonedSetup['cloneBitmap'] = displayObject;
				
				return mikoGame.sprite(properties, clonedSetup, stage);	
			},
			
			initDisplayObject: function(sprite, spriteData)
			{
				if(spriteData.initial.x)
				{
					switch(spriteData.initial.x)
					{
						case 'random':
							sprite.x = Math.random() * stage.canvas.width;
							break;
						default:
							sprite.x = stage.canvas.width * spriteData.initial.x;
							break;
					}
				}
				if(spriteData.initial.y)
				{
					switch(spriteData.initial.y)
					{
						case 'random':
							sprite.y = Math.random() * stage.canvas.height;
							break;
						default:
							sprite.y = stage.canvas.height * spriteData.initial.y;
							break;
					}
				}
				if(spriteData.initial.regX)
				{
					sprite.regX = spriteData.initial.regX;
				}
				if(spriteData.initial.regY)
				{
					sprite.regY = spriteData.initial.regY;
				}
				
				if(spriteData.initial.rotation)
				{
					sprite.rotation = spriteData.initial.rotation;
				}
			},
			
			getDisplayObject: function() {
				return displayObject;
			},
			
			getPosition: function() {
				return vector2d(displayObject.x, displayObject.y);
			}
		}
		
		that.initSprite();
		return that;
	},
	
	movableSprite: function(properties, spriteSetup, stage)
	{
		var vVelocity = vector2d(0, 0);
		
		var speed = 0;
		var rotation = 0;
		var accel = 0;
		
		var maxAccel = 0.8;
		var brakeSpeed = 0.1;
		var maxSpeed = 8;
		var rotationSpeed = 20;
		
		var accelControl = 0;
		var rotateControl = 0;
		
		var zSpeed = 0;
		var height = 0;
		var gravity = 0.01;
		
		var that = mikoGame.sprite(properties, spriteSetup, stage);
		
		var displayObject = that.getDisplayObject();
		var canvas = stage.canvas;
		
		that.init = function() {

		};
		
		that.constrainToBounds = function() {
			if(displayObject.x - that.halfWidth < 0) 
			{
				displayObject.x = that.halfWidth;
			}
			else if(displayObject.x + that.halfWidth > canvas.width)
			{
				displayObject.x = canvas.width - that.halfWidth;
			}
			if(displayObject.y - that.halfHeight < 0)
			{
				displayObject.y = that.halfHeight;		
			}
			else if(displayObject.y + that.halfHeight > canvas.height)
			{
				displayObject.y = canvas.height - that.halfHeight;		
			}
		};
		

		that.rotate = function() 
		{
			rotation = rotation + (rotateControl * (Math.PI * 2 / rotationSpeed));

			if(rotation > Math.PI * 2)
			{
				rotation = 0;
			}
			else if(rotation < 0)
			{
				rotation = Math.PI * 2;
			}
		},
		
		that.bounceOff = function(sprite2)
		{
			var bitmap1 = this.getDisplayObject();
			var bitmap2 = sprite2.getDisplayObject();
			
			var hitCentre1 = vector2d(bitmap1.x, bitmap1.y);
			var hitCentre2 = vector2d(bitmap2.x, bitmap2.y);

			var normal = hitCentre1.sub(hitCentre2, true);
			normal.normalize();

			var dotProduct = normal.dot(vVelocity);
			
			normal.scale(2);
			normal.scale(dotProduct);
			
			var reflected = vVelocity.sub(normal, true);
			
			return reflected;
		};
		
		that.hitTest = function(sprite2)
		{
			if(height > 0.3) return false;
			var bitmap1 = this.getDisplayObject();
			var bitmap2 = sprite2.getDisplayObject();

			hitCentre1 = vector2d(bitmap1.x, bitmap1.y);
			hitCentre2 = vector2d(bitmap2.x, bitmap2.y);

			hitCentre2.sub(hitCentre1);
			var distance = hitCentre2.length();

			if(distance < (this.width / 2 + sprite2.width / 2))
			{
				return true;
			}
			else
			{
				return false;
			}
		};
		
		that.processHit = function(sprite2)
		{
			var bitmap1 = this.getDisplayObject();
			var bitmap2 = sprite2.getDisplayObject();

			hitCentre1 = vector2d(bitmap1.x, bitmap1.y);
			hitCentre2 = vector2d(bitmap2.x, bitmap2.y);

			var directionVec = vector2d(bitmap1.x, bitmap1.y);
			directionVec.sub(hitCentre2);

			directionVec.normalize();
			directionVec.scale(this.width / 1.9 + sprite2.width / 1.9);

			hitCentre2.add(directionVec);

			bitmap1.x = hitCentre2.vx;
			bitmap1.y = hitCentre2.vy;
		};
		
		that.acceleration = function(accel) {
			accelControl = accel;
		};
		
		that.direction = function(direction) {
			rotateControl = direction;
		};
		
		that.accelerate = function() {
			speed = speed + (accelControl * maxAccel);
			speed = speed + (accelControl * maxAccel);
		},

		that.brake = function()
		{
			if(speed > 0)
			{
				speed = speed - brakeSpeed;
				if(speed < 0) speed = 0;	
			}
			if(speed < 0)
			{
				speed = speed + brakeSpeed;
				if(speed > 0) speed = 0;	
			}

			return speed;
		},
		
		that.update = function() {
			if(accelControl != 0)
			{
				that.accelerate();
			}
			else
			{
				if(!height)
				{
					that.brake();	
				}
			}
			
			if(rotateControl)
			{
				that.rotate();
			}
			
			that.constrainSpeed();
			
			vVelocity = vector2d(0, speed);
			vVelocity.rotate(rotation);
			
			height = height + zSpeed;
			zSpeed = zSpeed - gravity;
			
			if(height < 0)
			{
				height = 0;
				zSpeed = 0;
			}
			
			that.updateDisplayObject();
		};
		
		that.updateDisplayObject = function()
		{
			displayObject.rotation = vVelocity.radToDeg(rotation);
			displayObject.x = displayObject.x + vVelocity.vx;
			displayObject.y = displayObject.y + vVelocity.vy;
			
			that.constrainToBounds();
			
			if(height)
			{
				displayObject.scaleX = (1 + height);
				displayObject.scaleY = (1 + height); 	
			}
			
			if(speed === 0)
			{
				displayObject.gotoAndStop('run');
			}
		}
		
		that.jump = function()
		{
			zSpeed = 0.1;
		}
		
		that.constrainSpeed = function() {
			if(speed > 0) 
			{
				if(speed > maxSpeed) speed = maxSpeed;
			}
			else if(speed < 0)
			{
				if(speed < -maxSpeed) speed = -maxSpeed;
			}
		};
		
		that.onKeyDown = function(event)
		{
			switch(event.keyCode)
			{
				case mikoGame.KEY_LEFT_ARROW:  
					that.direction(-1);
					break;
				case mikoGame.KEY_RIGHT_ARROW:
					that.direction(1);
					break;
				case mikoGame.KEY_UP_ARROW:
					that.acceleration(-1);
					break;
				case mikoGame.KEY_DOWN_ARROW:
					that.acceleration(1);
					break;
				case mikoGame.KEY_SPACE:
					that.jump();
					break;
			}
			
			displayObject.gotoAndPlay('run');
		}
		
		that.onKeyUp = function(event)
		{
			switch(event.keyCode)
			{
				case mikoGame.KEY_LEFT_ARROW:
				case mikoGame.KEY_RIGHT_ARROW:
					that.direction(0);
					break;
				case mikoGame.KEY_UP_ARROW:
				case mikoGame.KEY_DOWN_ARROW:
					that.acceleration(0);
					break;
			}
		}

		that.init();
		return that;
	},
	
	log: function(message)
	{
		if(typeof message === 'string')
		{
			console.log('Miko game: ' + message);	
		}
		else
		{
			console.log(JSON.stringify(message));
		}
	},
	
	createGame: function(_gameData) {	
		var canvas = null;
		var stage = null;
		var score = null;

		var mouseTarget = null;
		var clicked = false;

		var txt = '';

		var _images = {};

		var sprites = { };

		var gameData = _gameData;

		var model = { 
			"sprites": { }
		};

		var toRemove = [];

		var listeners = {
			"key": {},
			"mouse": {}
		};

		var that = {
			engine: {
					"canvas": canvas,
					"stage": stage,
					"score": score,
					"mouseTarget": mouseTarget,
					"clicked": clicked,
					"sprites": sprites,
					"model": model,
					"gameData": gameData,
					"toRemove": toRemove
			},
			
			init: function()
			{
				if(!gameData.constants.canvasID)
				{
					throw "Game setup must contain constants.canvasID.";
				}
				var gameCanvas = document.getElementById(gameData.constants.canvasID);
				
				if(!gameCanvas)
				{
					throw "Canvas with constants.canvasID " + gameData.constants.canvasID + " does not exist.";
				}
				canvas = gameCanvas;
				stage = new Stage(canvas);

				score = 0;

				model.currentLevel = 0;
				this.loadLevel();
			},

			loadLevel: function()
			{
				var imgSrc = null;
				var i = 0;
				var callbackFunction = '';

				model.levelData = gameData.levels[model.currentLevel];
				var imageCallbacks = model.levelData['imagecallbacks'];
				
				for(i in imageCallbacks)
				{
					imageSrc = imageCallbacks[i]['cb'];
					callbackFunction = imageCallbacks[i]['cb'];
					_images[imageCallbacks[i]['id']] = this[callbackFunction]()
				}

				imageSources = model.levelData["images"];

				imageGroupSrc(imageSources, function(images) {
					for(imageSrc in images)
					{
						_images[imageSrc] = images[imageSrc];
					}
					that.imagesCreated();
				});
			},

			imagesCreated :function()
			{
				var sprites = model.levelData["sprites"];
				var currentSpriteData = null;
				var currentImage = null;
				var i = 0;
				var j = 0;
				var spriteID = null;
				var spriteClone = null;

				for(i = 0; i < model.levelData.spriteorder.length; i++)
				{
					spriteID = model.levelData.spriteorder[i];
					currentSpriteData = sprites[spriteID];
					
					if(!currentSpriteData)
					{
						mikoGame.log('Sprite with ID ' + spriteID + ' does not exist but is in spriteorder in the game setup.')
						continue;
					}
					
					if(!currentSpriteData.initial)
					{
						mikoGame.log('Sprite with ID ' + spriteID + ' does not have a section called initial containing initial width and height.')
						continue;
					}
					
					currentImage = _images[currentSpriteData.imageid];

					var newSprite = mikoGame.movableSprite({'image': currentImage}, currentSpriteData, stage);

					model.sprites[spriteID] = [ newSprite ];

					if(currentSpriteData.initial.listener)
					{
						for(j = 0; j < currentSpriteData.initial.listener.length; j++)
						{
							var listenerType = currentSpriteData.initial.listener[j];
							listeners[listenerType][spriteID] = true;
						}
					}

					if(currentSpriteData['num'])
					{	
						for(j = 1; j < currentSpriteData['num']; j++)
						{
							spriteClone = newSprite.clone();
							model.sprites[spriteID].push(spriteClone);
						}
					}
				}

				canvas.onmousedown = this.mousedown;
				canvas.onmouseup = this.mouseup;
				canvas.onmousemove = this.mousemove;

				stage.update();

				Ticker.setFPS(15);
				Ticker.addListener(this, true);

				mikoGame.keyboardMonitor({
					'monitorKeys': [ mikoGame.KEY_LEFT_ARROW, mikoGame.KEY_UP_ARROW, mikoGame.KEY_RIGHT_ARROW, mikoGame.KEY_DOWN_ARROW, mikoGame.KEY_SPACE],
					'preventDefaultKeys': [ 13, 8 ],
					'keyDownCallback': this.onKeyDown,
					'keyUpCallback': this.onKeyUp
				});
				
				if(this.onInit)
				{
					this.onInit(this.getEngine());	
				}
			},

			addSprite: function()
			{
				
			},

			getEngine: function()
			{
				this.engine = {
						"ticker": Ticker,
						"canvas": canvas,
						"stage": stage,
						"score": score,
						"mouseTarget": mouseTarget,
						"clicked": clicked,
						"sprites": sprites,
						"model": model,
						"gameData": gameData,
						"toRemove": toRemove
					};
					
				return this.engine;
			},

			tick: function()
			{
				if(this.onTick)
				{					
					this.onTick(this.getEngine());	
				}
				
				stage.update();
			},

			talk: function(sprite, text)
			{
				txt = new Text('Ouch!', '24px Arial', '#FFF');

				txt.textBaseline = 'top';
				txt.y = sprite.y + 20;
				txt.x = sprite.x + 40;
				txt.maxWidth = 800;
				stage.addChild(txt);
				toRemove.push([20, txt]);
			},

			mousedown: function(e)
			{
				if(!e) {var e = window.event;}
				
				canvasX = e.pageX - canvas.offsetLeft;
				canvasY = e.pageY - canvas.offsetTop;
				
				clicked = true;
				
				if(that.onMouseDown)
				{
					that.onMouseDown(e, canvasX, canvasY);
				}
			},

			mouseup: function(e)
			{
				if(!e) {var e = window.event};
				
				canvasX = e.pageX - canvas.offsetLeft;
				canvasY = e.pageY - canvas.offsetTop;
				
				clicked = false;
				
				if(that.onMouseUp)
				{
					that.onMouseUp(e, canvasX, canvasY);
				}
			},
			
			mousemove: function(e)
			{
				if(!e) {var e = window.event};
				
				canvasX = e.pageX - canvas.offsetLeft;
				canvasY = e.pageY - canvas.offsetTop;
				
				if(that.onMouseMove)
				{
					that.onMouseMove(e, canvasX, canvasY);
				}
			},

			onKeyDown: function(event)
			{
				if(listeners['key'])
				{
					for(var spriteID in listeners['key'])
					{
						for(var i = 0; i < model.sprites[spriteID].length; i++)
						{
							model.sprites[spriteID][i].onKeyDown(event);
						}
					}
				}
			},

			onKeyUp: function()
			{
				if(listeners['key'])
				{
					for(var spriteID in listeners['key'])
					{
						for(var i = 0; i < model.sprites[spriteID].length; i++)
						{
							model.sprites[spriteID][i].onKeyUp(event);
						}
					}
				}
			}
		};

		return that;
	}
}

