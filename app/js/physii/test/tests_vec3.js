'use strict';

function similar(a, b, prec)
{
	prec = prec || 1e-2;
	return Math.abs(a - b) < prec;
}

var vec3 = physii.vec3;

test('vector equal', function() {
	var v1 = vec3.create(1,2,3);
	var v2 = vec3.create(1,2,3);

	ok(vec3.equal(v1, v2), 'Two vecs equal');

	var v1 = vec3.create(1,2,3);
	var v2 = vec3.create(2,2,3);
	var v3 = vec3.create(1,3,3);
	var v4 = vec3.create(1,2,2);

	ok(!vec3.equal(v1, v2) && !vec3.equal(v1,v3) &&
		 !vec3.equal(v1, v4),
		 "Vecs not equal");
 	
	var v1 = vec3.create(1,2,3);
	var v2 = vec3.create(-1,-2,3);

	ok(!vec3.equal(v1,v2), "vec3 with neg components not equal");   

	var v1 = vec3.create(1,2,3);
	var v2 = vec3.create(1.1,2.1,3.1);

	ok(!vec3.equal(v1,v2,0.1), "vec3 not equal on exact precision");
	ok(vec3.equal(v1,v2,0.1000001), "vec3 equal on close precision");
}); 

test('vector rotate2D', function() {
	var v = vec3.create(1, 0, 0.5); 

	vec3.rotate2D(v, 0, 1, 2, Math.PI / 2);

	ok(vec3.equal(v, vec3.create(0,1,0.5)),
		'Rotate (1,0,0.5) 90 deg(xy) = (0,1,0.5)? ' + JSON.stringify(vec3.toString(v)));	

	var v2 = vec3.create(10, 5, 2);

	vec3.rotate2D(v2, 1, 2, 0, Math.PI / 2);
	ok(vec3.equal(v2, vec3.create(10,-2,5)),
		'Rotate (10,5,2) 90 deg(yz) = (10,-2,5)? ' + JSON.stringify(vec3.toString(v2)));	

}); 


test('vector angle2D', function() {
	var v1 = vec3.create(10, 10, 0);

	var r1 = vec3.angle2D(v1, 0, 1);

	ok(similar(r1, Math.PI / 4),
		"Direction (10,10,0) in xy is 45 deg? " +
		JSON.stringify(r1)
		);

	var v2 = vec3.create(10, 0, 10);
	var r2 = vec3.angle2D(v2, 1, 2);

	ok(similar(r2, Math.PI / 2),
		"Direction (10,0,10) in xy is 45 deg? " +
		JSON.stringify(r2)
		);

	var v3 = vec3.create(0, 0, -10);
	var r3 = vec3.angle2D(v3, 0, 2);

	ok(similar(r3, 3 * Math.PI / 2),
		"Direction (0,0,-10) in xy is 135 deg? " +
		JSON.stringify(r3)
		);
}); 

test('vector directionTo2D', function() {
	var v1 = vec3.create(1, 0, 0);
	var v2 = vec3.create(0, 1, 0);

	var res = vec3.directionTo2D(v1, v2, 'xy');

	ok(res > 0, 'Direction from ' + vec3.toString(v1) + 
		vec3.toString(v2) + 'is +ve? ' + JSON.stringify(res));

	var res = vec3.directionTo2D(v2, v1, 'xy');

	ok(res < 0, 'Direction from ' + vec3.toString(v2) + 
		vec3.toString(v1) + 'is -ve? ' + JSON.stringify(res));

	v1 = vec3.create(1, 0, 1);
	v2 = vec3.create(0, 1, 0);

	var res = vec3.directionTo2D(v1, v2, 'yz');

	ok(res < 0, 'Direction from ' + vec3.toString(v1) + 
		vec3.toString(v2) + 'is +ve? ' + JSON.stringify(res));

	v1 = vec3.create(0, 0, 1);
	v2 = vec3.create(0, -1, 0);

	var res = vec3.directionTo2D(v1, v2, 'yz');

	ok(res > 0, 'Direction from ' + vec3.toString(v1) + 
		vec3.toString(v2) + 'is +ve? ' + JSON.stringify(res));

	v1 = vec3.create(0, 1, 0);
	v2 = vec3.create(0, 0, 1);

	var res = vec3.directionTo2D(v1, v2, 'yz');

	ok(res > 0, 'Direction from ' + vec3.toString(v1) + 
		vec3.toString(v2) + 'is +ve? ' + JSON.stringify(res));

	v1 = vec3.create(0, 1, 0);
	v2 = vec3.create(0, 0, -1);

	var res = vec3.directionTo2D(v1, v2, 'yz');

	ok(res < 0, 'Direction from ' + vec3.toString(v1) + 
		vec3.toString(v2) + 'is +ve? ' + JSON.stringify(res));

	v1 = vec3.create(-1, 0, 0);
	v2 = vec3.create(0, 0, 1);

	var res = vec3.directionTo2D(v1, v2, 'xz');

	ok(res > 0, 'Direction from ' + vec3.toString(v1) + 
		vec3.toString(v2) + 'is +ve? ' + JSON.stringify(res));
}); 

test('vector distanceTo2D', function() {
	var v1 = vec3.create(3, 0, 10);
	var v2 = vec3.create(0, 4, 7);

	var d = vec3.distanceTo2D(v1, v2, 'xy');

	ok(d == 5, 'Dist ' + vec3.toString(v1) + ' to ' +
		vec3.toString(v2) + ' xy is 5? ' + JSON.stringify(d));

	var v1 = vec3.create(3, 0, 0);
	var v2 = vec3.create(0, 50, 4);

	var d = vec3.distanceTo2D(v1, v2, 'xz');

	ok(d == 5, 'Dist ' + vec3.toString(v1) + ' to ' +
		vec3.toString(v2) + ' xz is 5? ' + JSON.stringify(d));
}); 

test('vector angleBetween', function() {
	var v1 = vec3.create(0, 1, 0);
	var v2 = vec3.create(-10, 10, 0);

	var a = vec3.angleBetween(v1, v2);

	ok(similar(a, Math.PI / 4), "Angle between " + vec3.toString(v1) + 
		' and ' + vec3.toString(v2) + ' is pi/4? ' + JSON.stringify(a));
}); 
