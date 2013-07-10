'use strict';
var canmango = canmango || {};

(function(cm) {
	cm.shapespasm = {
		canvas: null,
		width: null,
		height: null,
		ctx: null,
		stage: null,
		drawer: null,

		setDrawer: function(drawer) {
			cm.shapespasm.drawer = drawer;
		},
		init: function() {
			my.stage = new createjs.Stage("canmangoCanvas");
			my.width = my.stage.canvas.width;
			my.height = my.stage.canvas.height;

			if(my.drawer && my.drawer.init)
			{
				my.drawer.init(my);
			}

			my.draw();
		},
		draw: function() {
			my.stage.removeAllChildren();

			var container = new createjs.Container();
			var w = 400;
			var h = 400;

			if(my.drawer) {
				my.drawer.draw(container, w, h);
			}

			container.regX = w / 2;
			container.regY = h / 2;
			container.x = my.width / 2;
			container.y = my.height / 2;

			my.stage.addChild(container);
			my.stage.update();
			
		}
	}	
	
	var my = cm.shapespasm;
})(canmango);
