var matrix = physii.matrix;

test('matrix mul', function() {
	var m1 = [
		[1,2,3],
		[4,5,6],
		[7,8,9]
	];
		
	var m2 = [
		[2,3,4],
		[5,6,7],
		[8,9,10]
	];

	var res = matrix.mul(m1, m2);

	ok(
		res[0][0] == 36 && res[0][1] == 42 && res[1][2] == 111,
		"matrix mul values correct" + 
		JSON.stringify(res)
	);

	m1 = [
		[1,7,3],
		[9,4,0],
		[2,7,1]
	];

	m2 = [
		[6,2,8],
		[9,1,3],
		[0,7,6]
	];

	res = matrix.mul(m1, m2);

	ok(
		res[0][0] == 69 && res[0][2] == 47 && res[1][2] == 84,
		"matrix mul values correct" + 
		JSON.stringify(res)
	);
}); 

test('matrix mulVec', function() {
	var m = [
		[1,2,3],
		[4,5,6],
		[7,8,9]
	];

	var v = [2, 3, 4];

	debugger; 
	var res = matrix.mulVec(m, v);

	ok(
		res[0] == 20 && res[1] == 47 && res[2] == 74,
		"vec mul values correct" +
		JSON.stringify(res)
	);
}); 

test('camera lookAt', function() {
	var vEye = vec.create(0, 10, 0);
	var vTarget = vec.create(0, 0, 0);
	var vUp = vec.create(0, 0, 1);
	var mCam = matrix.lookAt(vEye, vTarget, vUp);

	console.log( JSON.stringify(mCam) );
	var v = [0, 0, 10, 1];
	
	var res = matrix.mulVec(mCam, v);

	ok(
		res[0] == 0 && res[1] == 10 && res[2] == 0,
		"Vertex rotated using camera." +
		JSON.stringify(res)
	);

	v = [2, 0, 2, 1];

	var res = matrix.mulVec(mCam, v);

	ok(
		res[0] == 2 && res[1] == 2 && res[2] == 0,
		"Vertex rotated using camera." +
		JSON.stringify(res)
	);
});
