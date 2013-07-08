'use strict';

function similar(a, b, prec)
{
	prec = prec || 1e-2;
	return Math.abs(a - b) < prec;
}

var vec = physii.vector;

test('vector equal', function() {
	var v1 = vec.create(1,2,3);
	var v2 = vec.create(1,2,3);

	ok(vec.equal(v1, v2), 'Two vecs equal');

	var v1 = vec.create(1,2,3);
	var v2 = vec.create(2,2,3);
	var v3 = vec.create(1,3,3);
	var v4 = vec.create(1,2,2);

	ok(!vec.equal(v1, v2) && !vec.equal(v1,v3) &&
		 !vec.equal(v1, v4),
		 "Vecs not equal");
 	
	var v1 = vec.create(1,2,3);
	var v2 = vec.create(-1,-2,3);

	ok(!vec.equal(v1,v2), "vec with neg components not equal");   

	var v1 = vec.create(1,2,3);
	var v2 = vec.create(1.1,2.1,3.1);

	ok(!vec.equal(v1,v2,0.1), "vec not equal on exact precision");
	ok(vec.equal(v1,v2,0.1000001), "vec equal on close precision");
}); 

test('vector rotate2D', function() {
	var v = vec.create(1, 0, 0.5); 

	vec.rotate2D(v, 'x', 'y', 'z', Math.PI / 2);

	ok(vec.equal(v, vec.create(0,1,0.5)),
		'Rotate (1,0,0.5) 90 deg(xy) = (0,1,0.5)? ' + JSON.stringify(vec.toString(v)));	

	var v2 = vec.create(10, 5, 2);

	vec.rotate2D(v2, 'y', 'z', 'x', Math.PI / 2);
	ok(vec.equal(v2, vec.create(10,-2,5)),
		'Rotate (10,5,2) 90 deg(yz) = (10,-2,5)? ' + JSON.stringify(vec.toString(v2)));	

}); 


test('vector angle2D', function() {
	var v1 = vec.create(10, 10, 0);

	var r1 = vec.angle2D(v1, 'x', 'y');

	ok(similar(r1, Math.PI / 4),
		"Direction (10,10,0) in xy is 45 deg? " +
		JSON.stringify(r1)
		);

	var v2 = vec.create(10, 0, 10);
	var r2 = vec.angle2D(v2, 'y', 'z');

	ok(similar(r2, Math.PI / 2),
		"Direction (10,0,10) in xy is 45 deg? " +
		JSON.stringify(r2)
		);

	var v3 = vec.create(0, 0, -10);
	var r3 = vec.angle2D(v3, 'x', 'z');

	ok(similar(r3, 3 * Math.PI / 2),
		"Direction (0,0,-10) in xy is 135 deg? " +
		JSON.stringify(r3)
		);
}); 

test('vector directionTo2D', function() {
	var v1 = vec.create(1, 0, 0);
	var v2 = vec.create(0, 1, 0);

	var res = vec.directionTo2D(v1, v2, 'xy');

	ok(res > 0, 'Direction from ' + vec.toString(v1) + 
		vec.toString(v2) + 'is +ve? ' + JSON.stringify(res));

	var res = vec.directionTo2D(v2, v1, 'xy');

	ok(res < 0, 'Direction from ' + vec.toString(v2) + 
		vec.toString(v1) + 'is -ve? ' + JSON.stringify(res));

	v1 = vec.create(1, 0, 1);
	v2 = vec.create(0, 1, 0);

	var res = vec.directionTo2D(v1, v2, 'yz');

	ok(res < 0, 'Direction from ' + vec.toString(v1) + 
		vec.toString(v2) + 'is +ve? ' + JSON.stringify(res));

	v1 = vec.create(0, 0, 1);
	v2 = vec.create(0, -1, 0);

	var res = vec.directionTo2D(v1, v2, 'yz');

	ok(res > 0, 'Direction from ' + vec.toString(v1) + 
		vec.toString(v2) + 'is +ve? ' + JSON.stringify(res));

	v1 = vec.create(0, 1, 0);
	v2 = vec.create(0, 0, 1);

	var res = vec.directionTo2D(v1, v2, 'yz');

	ok(res > 0, 'Direction from ' + vec.toString(v1) + 
		vec.toString(v2) + 'is +ve? ' + JSON.stringify(res));

	v1 = vec.create(0, 1, 0);
	v2 = vec.create(0, 0, -1);

	var res = vec.directionTo2D(v1, v2, 'yz');

	ok(res < 0, 'Direction from ' + vec.toString(v1) + 
		vec.toString(v2) + 'is +ve? ' + JSON.stringify(res));

	v1 = vec.create(-1, 0, 0);
	v2 = vec.create(0, 0, 1);

	var res = vec.directionTo2D(v1, v2, 'xz');

	ok(res > 0, 'Direction from ' + vec.toString(v1) + 
		vec.toString(v2) + 'is +ve? ' + JSON.stringify(res));
}); 

test('vector distanceTo2D', function() {
	var v1 = vec.create(3, 0, 10);
	var v2 = vec.create(0, 4, 7);

	var d = vec.distanceTo2D(v1, v2, 'xy');

	ok(d == 5, 'Dist ' + vec.toString(v1) + ' to ' +
		vec.toString(v2) + ' xy is 5? ' + JSON.stringify(d));

	var v1 = vec.create(3, 0, 0);
	var v2 = vec.create(0, 50, 4);

	var d = vec.distanceTo2D(v1, v2, 'xz');

	ok(d == 5, 'Dist ' + vec.toString(v1) + ' to ' +
		vec.toString(v2) + ' xz is 5? ' + JSON.stringify(d));
}); 

test('vector angleBetween', function() {
	var v1 = vec.create(0, 1, 0);
	var v2 = vec.create(-10, 10, 0);

	var a = vec.angleBetween(v1, v2);

	ok(similar(a, Math.PI / 4), "Angle between " + vec.toString(v1) + 
		' and ' + vec.toString(v2) + ' is pi/4? ' + JSON.stringify(a));
}); 
