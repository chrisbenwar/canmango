'use strict';
var canmango = canmango || {};

(function(cm) {
	cm.shapinSafari = {
		_canvas: null,
		_ui: null,

		draw: function() {

			var ui = cm.shaperUI;
			ui.init('canmangoCanvasOverlay');
			ui.createHandle('drag1', {
				handler: function() {},
				pos: [100, 100]
			});

			var canvas = document.getElementById('canmangoCanvasUnderlay');
			var editor = editor2d(canvas);

			var design = {
				elems: [
					{
						id: 'rect',
						points: [
							{ x: 0.2, y: 0.2 },
							{ x: 0.4, y: 0.2 },
							{ x: 0.4, y: 0.4 },
							{ x: 0.2, y: 0.4 }, 
						],
						fillStyle: '#ee2',
						strokeStyle: '#b00',
						lineWidth: 0.05
					},
		      {
		        id: 'roundStripyRect', 
		        points: [
		          { x: 0.4, y: 0.5, curve: -0.2 },
		          { x: 0.8, y: 0.5 },
		          { x: 0.8, y: 0.7, curve: -0.2 },
		          { x: 0.4, y: 0.7 }
		        ],
		        fillStyle: '#d70',
		        strokeStyle: '#900',
		        lineWidth: 0.05,
						/*
		        pattern: {
		 		     id: 'shirt',
		 		     type: 'stripes', 
		 		     colour1: '#38BDD1',
		 		     width1: 0.4,
		 		     colour2: '#000000',
		 		     width2: 0.3,
		 		     colour3: '#ffffff',
		 		     width3: 0.04, 
		 		     size: 0.25,
		 		     rotation: 0,
		 		     repeat: 0
						}
						*/
		 	     },
				]
			};

			editor.loadDesign(design);
			editor.drawDesign();

		}
	}
	
})(canmango);
