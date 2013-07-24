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

	var res = matrix.mulVec(m, v);

	ok(
		res[0] == 20 && res[1] == 47 && res[2] == 74,
		"vec mul values correct" +
		JSON.stringify(res)
	);

	m = [
		[1, 0, 0, 10],
		[0, 1, 0, 0],
		[0, 0, 1, 0],
		[0, 0, 0, 1]
	];

	v = [10, 10, 10, 1];

	res = matrix.mulVec(m, v);

	ok(res[0] == 20 && res[1] == 10 && res[2] == 10 && res[3] == 1,
			"simple vec translation" +
			JSON.stringify(res)
	);

	m = [
		[2, 0, 0, 0],
		[0, 2, 0, 0],
		[0, 0, 2, 0],
		[0, 0, 0, 1],
	];

	v = [10, 10, 10, 1];

	res = matrix.mulVec(m, v);

	ok(res[0] == 20 && res[1] == 20 && res[2] == 20 && res[3] == 1,
			"simple vec scale" +
			JSON.stringify(res)
	);
}); 

test('matrix swapRowsAndColumns', function() {
	var m = [
		[1,2,3],
		[4,5,6],
		[7,8,9],
	];	

	res = matrix.swapRowsAndCols(m);

	ok(
		res[0][1] == 4 && res[1][2] == 8 && res[2][1] == 6,
		"Swapping rows and cols" + JSON.stringify(res)	
	);
}); 

test('camera lookAt', function() {
	var vEye = vec.create(0, 10, 0);
	var vTarget = vec.create(0, 0, 0);
	var vUp = vec.create(0, 0, 1);
	var mCam = matrix.lookAt(vEye, vTarget, vUp);

	console.log( JSON.stringify(mCam) );
	var v = [0, 2, -2, 1]; 
	
	var res = matrix.mulVec(matrix.swapRowsAndCols(mCam), v);

	ok(
		res[0] == 0 && res[1] == -2 && res[2] == -8,
		"Vertex rotated using camera." +
		JSON.stringify(res)
	);

	v = [2, 0, -2, 1];

	var res = matrix.mulVec(matrix.swapRowsAndCols(mCam), v);

	ok(
		res[0] == -2 && res[1] == -2 && res[2] == -10,
		"Vertex rotated using camera." +
		JSON.stringify(res)
	);
});

test('camera perspective', function() {
	var m = matrix.makePerspective(90, 1, 1, 1000);
	var mP = matrix.swapRowsAndCols(m); 

	var v = [10, 10, -1, 1];
	var res = matrix.mulVec(mP, v);
	var vNew = matrix.perspectiveDivide(res);

	ok(similar(vNew[0], 10) && similar(vNew[1], 10), 
		'Point on frustum front is unmoved' +
		JSON.stringify(res)
	);
	
	v = [10, 10, -10, 1];
	res = matrix.mulVec(mP, v);
	vNew = matrix.perspectiveDivide(res);

	console.log(res);
	console.log(vNew);

	ok(vNew[0] < 10 && vNew[1] < 10, 
		'Point within frustum is moved' +
		JSON.stringify(res)
	);

	var mPNew = matrix.reversePerspective(mP);
});

test('screen coord to normalized', function() {
	var pos = [0.7, 0.5, -0.2, 1];
	var width = 800;
	var height = 600;

	var sp = matrix.normalizedPosToScreen(pos, width, height)
	JSON.stringify(sp);
	var np = matrix.screenToNormalizedPos(sp, width, height)
	JSON.stringify(np);

	ok(np[0] == 0.7 && np[1] == 0.5, "Normalized screen pos reversed: " +
	 JSON.stringify(np));	

}); 

test('perspective divide', function() {
	var vDiv = matrix.perspectiveDivide([12, 6, 3, 2]);

	ok(vDiv[0] == 6 && vDiv[1] == 3 && vDiv[2] == 1.5 && vDiv[3] == 1, "perspective divide works: " +
		JSON.stringify(vDiv));
}); 

test('getInverse', function() {
	var m = matrix.getIdentity();

	var mInv = matrix.getInverse(m);

	ok(mInv[0][0] == 1 && mInv[1][1] == 1 && mInv[2][2] == 1 && mInv[3][3] == 1, "inv identitiy is identity: " +
		JSON.stringify(mInv));

	m = matrix.multiplyScalar(matrix.getIdentity(), 4);	
	mInv = matrix.getInverse(m);

	ok(mInv[0][0] == 0.25 && mInv[1][1]  == 0.25 && 
		mInv[2][2]  == 0.25 && mInv[3][3]  == 0.25, "mul identitiy inverse is identity: " +
		JSON.stringify([m, mInv]));
});  

test('getDeterminant', function() {
	var m = matrix.multiplyScalar(matrix.getIdentity(), 4);	
	var det = matrix.getDeterminant(m);

	ok(det == 256, "Det of 4 * identity is 4: " +
		JSON.stringify([m, det]));
}); 


