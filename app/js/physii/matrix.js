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
		 * Create the inverse of a matrix.
		 */
		inverse: function(m)
		{
			
		},
		/**
		 * OpenGL type look at function.
		 *
		 * This is a modified version of that from three.js.
		 *
		 * @returns A view matrix.
		 */
		lookAt: function(vEye, vTarget, vUp)
		{
			var zaxis = vec.normalize(vec.sub(vEye, vTarget, true), true);    // The "look-at" vector.
			var xaxis = vec.normalize(vec.cross(vUp, zaxis, true), true);// The "right" vector.
			var yaxis = vec.cross(zaxis, xaxis, true);     // The "up" vector.
	 
			// Create a 4x4 orientation matrix from the right, up, and at vectors
			var mOrientation = [
					[xaxis.x, yaxis.x, zaxis.x, 0],
					[xaxis.y, yaxis.y, zaxis.y, 0],
					[xaxis.z, yaxis.z, zaxis.z, 0],
					[	0,       0,       0,     1]
			];
			 
			// Create a 4x4 translation matrix by negating the eye position.
			var mTranslation = [
						[1,      0,      0,     0],
						[0,      1,      0,     0], 
						[0,      0,      1,     0],
					[-vEye.x, -vEye.y, -vEye.z,  1]
			];

			return ( my.mul(mTranslation,mOrientation) );
		},
		/**
		 * Taken from three.js. Helper function for making projection
		 * matrices.
		 */
		makeFrustum: function ( left, right, bottom, top, near, far ) {

			var m, x, y, a, b, c, d;

			x = 2 * near / ( right - left );
			y = 2 * near / ( top - bottom );

			a = ( right + left ) / ( right - left );
			b = ( top + bottom ) / ( top - bottom );
			c = - ( far + near ) / ( far - near );
			d = - 2 * far * near / ( far - near );

			var mP = [
				[x, 0, 0, 0],
				[0, y, 0, 0],
				[a, b, c, -1],
				[0, 0, d, 0],
			];

			return mP;
		},
		/**
		 * Build a perspective projection matrix.
		 *
		 * Taken from three.js.
		 */
		makePerspective: function ( fov, aspect, near, far ) {
			var ymax, ymin, xmin, xmax;

			ymax = near * Math.tan( fov * Math.PI / 360 );
			ymin = - ymax;
			xmin = ymin * aspect;
			xmax = ymax * aspect;

			return my.makeFrustum( xmin, xmax, ymin, ymax, near, far );
		},
		/**
		 * Build an orthographic projection matrix.
		 *
		 * Taken from three.js.
		 */
		makeOrthographic: function ( left, right, top, bottom, near, far ) {

			var w = right - left;
			var h = top - bottom;
			var p = far - near;

			var x = ( right + left ) / w;
			var y = ( top + bottom ) / h;
			var z = ( far + near ) / p;

			var mO = [
				[2 / w, 0, 0, 0],		
				[0, 2 / h, 0, 0],		
				[0, 0, -2 / p, 0],		
				[-x, -y, -z, 1],		
			];

			return mO;
		},
		swapRowsAndCols: function(m)
		{
			var dimension = m.length;
			var mOut = [];
			for(var i = 0; i < dimension; i++)
			{
				mOut.push([]);
			}

			for(var i = 0; i < m.length; i++)
			{
				for(var j = 0; j < m[i].length; j++)
				{
					mOut[j][i] = m[i][j];
				}
			}

			return mOut;
		}
	};

	var my = p.matrix;

})(physii);

