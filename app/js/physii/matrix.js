'use strict';
var physii = physii || {};

(function(p) {
	/**
	 * Functions for creating and manipulating matrices.
	 *
	 * Vectors are stored in format {"x": xVal, "y": yVal, "z": zVal}
	 *
	 * This is not well tested or production ready.
	 */
	p.matrix = 
	{
		mulVec: function(m, v)
		{
			var vDim = v.length;
			var mDim = m.length;
			var vOut = [];
			var sum = 0;
			var mVal = 0;
			var vVal = 0;

			for(var i = 0; i < v.length; i++)
			{
				sum = 0;
				for(var j = 0; j < mDim; j++)
				{
					vVal = v[j];
					mVal = m[i][j];
					sum = sum + (mVal * vVal); 
				}

				vOut[i] = sum;
			}

			return vOut;
		},
		mul: function(m1, m2)
		{
			var dimensions = m1.length;
			var mOutput = [];

			for(var i = 0; i < dimensions; i++)
			{
				mOutput.push([]);
			}
			
			for(var i = 0; i < dimensions; i++)
			{
				for(var j = 0; j < dimensions; j++)
				{
					mOutput[i][j] = 
						(m1[i][0] * m2[0][j]) + 
						(m1[i][1] * m2[1][j]) +
						(m1[i][2] * m2[2][j]); 

					if(m1.length == 4)
					{
						mOutput[i][j] += m1[i][3] * m2[3][j];
					}
				}	
			}			

			return mOutput;
		},
		/**
		 *
		 * @returns A matrix.
		 */
		lookAt: function(vEye, vTarget, vUp)
		{
			var zaxis = vec.normalize(vec.sub(vTarget, vEye, true), true);    // The "look-at" vector.
			var xaxis = vec.normalize(vec.cross(vUp, zaxis, true), true);// The "right" vector.
			var yaxis = vec.cross(zaxis, xaxis, true);     // The "up" vector.
	 
			// Create a 4x4 orientation matrix from the right, up, and at vectors
			/**
			var mOrientation = [
					[xaxis.x, yaxis.x, zaxis.x, 0],
					[xaxis.y, yaxis.y, zaxis.y, 0],
					[xaxis.z, yaxis.z, zaxis.z, 0],
					[	0,       0,       0,     1]
			];
			*/
			var mOrientation = [
					[xaxis.x, xaxis.y, xaxis.z, 0],
					[yaxis.x, yaxis.y, yaxis.z, 0],
					[zaxis.x, zaxis.y, zaxis.z, 0],
					[	0,       0,       0,     1]
			];
			 
			// Create a 4x4 translation matrix by negating the eye position.
			var mTranslation = [
						[1,      0,      0,     0],
						[0,      1,      0,     0], 
						[0,      0,      1,     0],
					[-vEye.x, -vEye.y, -vEye.z,  1]
			];
	 
			// Combine the orientation and translation to compute the view matrix
			return ( my.mul(mOrientation,mTranslation) );
			//return ( my.mul(mTranslation,mOrientation) );
		},
		perspective: function(left, right, bottom, top, near, far)
    {
			var mPerspective = [
				[2*near/(right - left), 0, (right+left)/(right -left), 0],
				[0, 2*near/(top - bottom), (top + bottom)/(top-bottom), 0],
				[0, 0, -(far +near)/(far - near), -2*far*near/(far - near)],
				[0, 0, -1, 0]
			];

			return mPerspective;
    }
	};

	var my = p.matrix;

})(physii);

