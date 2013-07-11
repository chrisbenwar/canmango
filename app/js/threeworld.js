'use strict';
var canmango = canmango || {};

(function(cm) {
	var vec = physii.vector;
	var matrix = physii.matrix;

	cm.threeworld= {
		_canvas: null,
		_width: null,
		_height: null,

		_worldData: [],
		_worldWidth: 400,
		_worldHeight: 400,

		renderer: null,
		
		init: function()
		{
			var $container = $('#canmangoCanvas');
			my._width = $container.width();
			my._height = $container.height();

			my.renderer = new THREE.CanvasRenderer({antialias: true});

			my.renderer.setClearColorHex( 0xeeeeee, 1 );

			var VIEW_ANGLE = 90,
			ASPECT = my._width / my._height,
			NEAR = 1,
			FAR = 1000;

			my.camera = new THREE.PerspectiveCamera(
				VIEW_ANGLE,
				ASPECT,
				NEAR,
				FAR);

			my.scene = new THREE.Scene();
			my.scene.add(my.camera);

			my.camera.position.z = -150;
			my.camera.position.y = 50;
			my.camera.position.x = 200;

			my.camera.up = new THREE.Vector3( 0, 1, 0 );
			my.camera.lookAt(new THREE.Vector3(200, 0, 0));

			my.renderer.setSize(my._width, my._height);

			$container.append(my.renderer.domElement);

			my.addGuides();	

			my.addRects();

			my.draw();
		},

		addGuides: function()
		{
			var numGuides = 10;

			for(var i = 0; i < numGuides; i++)
			{
				var zOff = (my._worldHeight / numGuides) * i;

				my._worldData.push(
					my.createGuide(0, 0, zOff, my._worldWidth, 0, zOff)
				);	
			}
		},

		createGuide: function(x1, y1, z1, x2, y2, z2)
		{
			return [
				{x: x1, y: y1, z: z1}, {x: x2, y: y2, z: z2}
			];
		},

		addRects: function()
		{
			my._worldData.push(my.createRect(0, 280, 20, 340, 20));
			my._worldData.push(my.createRect(0, 50, 50, 90, 80));
			my._worldData.push(my.createRect(0, 200, 150, 240, 200));
		},

		createRect: function(top, left, bottom, right, depth)
		{
			return [
				{x: left, y: top, z: depth}, 
				{x: right, y: top, z: depth},
				{x: right, y: bottom, z: depth},
				{x: left, y: bottom, z: depth},
				{x: left, y: top, z: depth} 
			];
		},

		draw: function()
		{
			var from = null;
			var to = null;

			var vEye = vec.create(0, 100, 0);
			var vTarget = vec.create(0, 0, 0);
			var vUp = vec.create(0, 1, 0);

			var mCamera = matrix.lookAt(vEye, vTarget, vUp)
			var eye = vec.create(20, 50, -1000);
			var mP = matrix.makePerspective(100, 1, 1, 200);
			console.log( JSON.stringify(['mP', mP]));
			var mFin = matrix.mul(mP, mCamera);

			for(var i = 0; i < my._worldData.length; i++)
			{
				var item = my._worldData[i];

				if(item.length)
				{
					for(var j = 0; j < item.length; j++)
					{
						if(item[j + 1])
						{
							var from = item[j];
							var to = item[j + 1];
							var geometryX = new THREE.Geometry();
							geometryX.vertices.push(new THREE.Vector3(from.x, from.y, from.z));
							geometryX.vertices.push(new THREE.Vector3(to.x, to.y, to.z));
							var lineX = new THREE.Line(geometryX, new THREE.LineBasicMaterial({color: 0x000000}));
							my.scene.add(lineX);
						}
					}
				}
			}
			my.renderer.render(my.scene, my.camera);
		},

	};
	var my = cm.threeworld;
})(canmango);
