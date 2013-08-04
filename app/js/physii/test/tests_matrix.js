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

	var v = [0, 2, -2, 1]; 
	
	var res = matrix.mulVec(mCam, v);

	ok(
		res[0] == 0 && res[1] == -2 && res[2] == -8,
		"Vertex rotated using camera." +
		JSON.stringify(res)
	);

	v = [2, 0, -2, 1];

	var res = matrix.mulVec(mCam, v);

	ok(
		res[0] == -2 && res[1] == -2 && res[2] == -10,
		"Vertex rotated using camera." +
		JSON.stringify(res)
	);

	var vEye = vec.create(-2, -2, 10);
	var vTarget = vec.create(-2, -2, -1);
	var vUp = vec.create(0, 1, 0);
	var mCam = matrix.lookAt(vEye, vTarget, vUp);

	v = [2, 0, 0, 1];

	var res = matrix.mulVec(mCam, v);
	var vRes = vec.fromArray(res);

	ok(vec.equal(vRes, vec.create(4, 2, -10)), "V rotated: " +
		JSON.stringify([res]));

});

test('camera perspective', function() {
	var mP = matrix.makePerspective(90, 1, 1, 1000);

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

	posTopLeft  = [-1, 1, 0, 1];
	posBottomRight = [1, -1, 0, 1];

	var pTL = matrix.normalizedPosToScreen(posTopLeft, width, height)
	ok(vec.equal(vec.fromArray(pTL), vec.create(0, 0, 0)), 
		"Top left -1,1 to 0,0: " + JSON.stringify(pTL));

	var pBR = matrix.normalizedPosToScreen(posBottomRight, width, height)
	ok(vec.equal(vec.fromArray(pBR), vec.create(800, 600, 0)), 
		"Bottom right 1,-1 to 800,600: " + JSON.stringify(pBR));

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

test('matrix equals', function() {
	var m1 = [ [1, 2], [3, 4] ];	
	var m2 = [ [1, 2], [3, 4] ];

	ok(matrix.equals(m1, m2), "equal: " + JSON.stringify([m1, m2]));

	m1 = [ [1, 2], [3, 4] ];	
	m2 = [ [1, 3], [3, 4] ];

	ok(!matrix.equals(m1, m2), "not equal: " + JSON.stringify([m1, m2]));
	
	m1 = [ [1.009, 2], [3.001, 4] ];	
	m2 = [ [1, 2.001], [3, 4] ];

	ok(matrix.equals(m1, m2), "equal precision: " + JSON.stringify([m1, m2]));
}); 

test('Reverse view matrix', function() {
	var vEye = vec.create(0, 100, 500);
	var vTarget = vec.create(0, 0, 500 - 200);
	var vUp = vec.create(0, 1, 0);
	var m = matrix.lookAt(vEye, vTarget, vUp);	

	var mInv = matrix.getInverse(m);
	var m2 = matrix.getInverse(mInv);

	ok(matrix.equals(m, m2), "no test: " + JSON.stringify(''));	

	var v2 = matrix.mulVec(m, [2, 2, -2]);
	var v3 = matrix.mulVec(mInv, v2);
	var v2Arr = vec.fromArray(v2);
	var v3Arr = vec.fromArray(v3);
	
	ok(vec.equal(v2Arr, v3Arr), "description: " +
		JSON.stringify([v2Arr, v3Arr]));
}); 

test('Perspective / reverse perspective', function() {
	var m = matrix.perspective(90, 1, 1000);
	var mR = matrix.reversePerspective(90, 1, 1000);
	var mInvR = matrix.getInverse(m);
	var v = [200, 200, -10, 1];

	var vP = matrix.mulVec(m, v);
	var vPDiv = matrix.perspectiveDivide(vP);

	ok(vec.equal(vec.fromArray(vPDiv), vec.create(20, 20, 0.9, 1), 0.1), "After perspective: " +
		JSON.stringify([vP, vPDiv]));

	ok(matrix.equals(mR, mInvR), "Reverse perspective equals inverse: " +
		JSON.stringify([mR, mInvR]));

	var vRP = matrix.mulVec(mR, vPDiv);
	vRP = matrix.perspectiveDivide(vRP);

	ok(vec.equal(vec.fromArray(vRP), vec.create(200, 200, -10), 0.1), 
		"Reverse perspective matches original: " + JSON.stringify([vRP]));

	var vInvRP = matrix.mulVec(mInvR, vPDiv);
	vInvRP = matrix.perspectiveDivide(vInvRP);
	ok(vec.equal(vec.fromArray(vInvRP), vec.create(200, 200, -10), 0.1), 
		"Inverse perspective matches original: " + JSON.stringify([vInvRP]));
}); 

test('World to screen in steps', function() {
	var x = 0;
	var y = 0;
	var z = 10;
	var width = 800;
	var height = 800;

	var pos = [10, 0, -10, 1];
	var pos1 = [10, 0, 9, 1];

	var vEye = vec.create(x, y, z);
	var vTarget = vec.create(0, 0, 0);
	var vUp = vec.create(0, 1, 0);
	var mView = matrix.lookAt(vEye, vTarget, vUp)

	var viewPos = matrix.mulVec(mView, pos);
	var vViewPos = vec.fromArray(viewPos);

	ok(vec.equal(vViewPos, vec.create(10, 0, -20)), 
		"World to view correct." + JSON.stringify([vViewPos, mView, pos]));

	var aspect = 1;
	var mP = matrix.perspective(90, 1, 100);

	var mFin = matrix.mul(mP, mView);

	var finPos = matrix.mulVec(mFin, pos);
	var divPos = matrix.perspectiveDivide(finPos);

	ok(Math.abs(divPos[0] - 0.5) < 0.01, "Projected x-coord as expected: " +
		JSON.stringify(divPos));

	var screenPos = matrix.normalizedPosToScreen(divPos, width, height);
	var pPos = matrix.project(pos, mFin, width, height);
	var equal = true;
	for(var i = 0; i < screenPos.length; i++)
	{
		if(screenPos[i] != pPos[i])
		{
			equal = false;
			break;
		}
	}

	ok(equal, "matrix.project same as individual ops" +
			JSON.stringify([screenPos, pPos]));

	var finPos1 = matrix.mulVec(mFin, pos1);
	var divPos1 = matrix.perspectiveDivide(finPos1);
	console.log(JSON.stringify([divPos1]));

	ok(divPos1[2] < divPos[2], "Closer point has lower projected z: " +
		JSON.stringify([divPos1, divPos]));

	console.log(JSON.stringify([screenPos]));


});

test('Screen to world in steps', function() {
	var x = 0;
	var y = 0;
	var z = 10;
	var width = 800;
	var height = 800;

	var pos = [10, 10, -90, 1];

	var vEye = vec.create(x, y, z);
	var vTarget = vec.create(0, 0, 0);
	var vUp = vec.create(0, 1, 0);
	var mView = matrix.lookAt(vEye, vTarget, vUp)

	var viewPos = matrix.mulVec(mView, pos);
	var vViewPos = vec.fromArray(viewPos);

	ok(vec.equal(vViewPos, vec.create(10, 0, -101)), 
		"World to view correct." + JSON.stringify([vViewPos, mView, pos]));

	var aspect = 1;
	var mP = matrix.perspective(90, 1, 100);

	var mFin = matrix.mul(mP, mView);

	var p = matrix.project(pos, mFin, width, height);

	console.log(JSON.stringify(['p', p]));

	var mRView = matrix.getInverse(mView);
	var mRP = matrix.reversePerspective(90, 1, 100);
	var mRFin = matrix.mul(mRView, mRP);
	var uP = matrix.unProject(p, mRFin, width, height);

	ok(vec.equal(vec.fromArray(uP),vec.fromArray(pos)), "Project eq unproject: " +
		JSON.stringify([uP, pos]));
}); 
