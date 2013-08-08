'use strict';
var physii = physii || {};

(function(p) {
	/**
	 * Functions for creating and manipulating vectors.
	 *
	 * Vectors are stored in format [ xVal,  yVal,  zVal]
	 *
	 * This is not well tested or production ready.
	 */
	p.vec3 = 
	{
		/**
		 * Precision of comparison operations.
		 */
		precision: 1e-8,

		/**
		 * Create a representation of a vector in format
		 * { "x": xVal, "y": yVal, "z": zVal }
		 */
		create: function(x, y, z)
		{
			x = x || 0; 
			y = y || 0; 
			z = z || 0;

			return [x, y, z];
		},

		/**
		 * Shorthand for setting x, y and z for a vector.
		 *
		 * @returns A reference to the vector.
		 */
		set: function(v, x, y, z) 
		{
			v[0] = x || 0; 
			v[1] = y || 0; 
			v[2] = z || 0;
		},

		/**
		 * Multiply each component of the vector by a number
		 *
		 * @param v The vector.
		 * @param factor The value to multiply by.
		 * @param clone Whether to operate on v or a cloned vector.
		 *
		 * @returns Either v or a clone with the operation applied.
		 */
		scale: function(v, factor, clone) 
		{
			if(clone)
			{
				return [ v[0] * factor,  v[1] * factor,  v[2] * factor];
			}
			else
			{
				v[0] *= factor;
				v[1] *= factor;
				v[2] *= factor;
				return v;
			}
		},
				
		/**
		 * Add two vectors together.
		 *
		 * @param v A vector.
		 * @param v2 A vector to add.
		 * @param clone Whether to operate on v or a cloned vector.
		 *
		 * @returns Either v or a clone with the operation applied.
		 */
		add: function(v, v2, clone) 
		{
			if(clone)
			{
				return [ v[0] + v2[0],  v[1] + v2[1],  v[2] + v2[2]];
			}
			else
			{
				v[0] += v2[0];
				v[1] += v2[1];
				v[2] += v2[2];
				return v;
			}
		},
				
		/**
		 * Subtract one vector from another.
		 *
		 * @param v A vector
		 * @param v2 A vector to subtract from v2
		 * @param clone Whether to operate on v or a cloned vector.
		 *
		 * @returns Either v or a clone with the operation applied.
		 */
		sub: function(v, v2, clone) 
		{
			if(clone)
			{
				return [ v[0] - v2[0],  v[1] - v2[1],  v[2] - v2[2]];
			}
			else
			{
				v[0] -= v2[0];
				v[1] -= v2[1];
				v[2] -= v2[2];
				return v;
			}
		},
				
		/**
		 * Find the component of a vector that is pointing in the
		 * same direction as another vector.
		 *
		 * @param v A vector.
		 * @param v2 A vector to project on to v.
		 */
		projection: function(v, v2)
		{
			var N = my.normalize(v, true);
			my.scale(N, my.dot(v2, N));
			return N;
		},

		/**
		 * Find the component of one vector that points perpendicular
		 * from another vector to it.
		 *
		 * @param v A vector to point the rejection from.
		 * @param v2 A vector to point the rejection to. 
		 */
		rejection: function(v, v2)
		{
			var proj = my.projectionOf(v, v2, true);
			var rej = my.sub(v2, proj, true);
			return rej;
		},

		/**
		 * Reflect a vector in a mirror defined by a normal.
		 */
		reflect: function(v, normal)
		{
			var normal = my.normalize(normal, true); 
			my.scale(normal, -2 * my.dot(v, normal));
			my.add(normal, v);
			return normal;
		},

		/**
		 * Point a vector in the opposite direction.
		 *
		 * @param v A vector.
		 * @param clone Whether to operate on v or a cloned vector.
		 *
		 * @returns Either v or a clone with the operation applied.
		 */
		negate: function(v, clone) 
		{
			if(clone)
			{
				return [ -v[0],  -v[1],  -v[2]];	
			}
			else
			{
				v[0] = -v[0];
				v[1] = -v[1];
				v[2] = -v[2];
				return v;
			}
		},
				
		/**
		 * Find the length of a vector.
		 */
		length: function(v) 
		{
			return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
		},

		/**
		 * Find the square of the length of a vector. To save
		 * doing a square root if it is needed for some physical
		 * calculation.
		 *
		 * @param v A vector.
		 */	
		lengthSquared: function(v) 
		{
			return v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
		},
				
		/**
		 * Normalize a vector (give it length of 1 unit).
		 *
		 * @param v A vector.
		 * @param clone Whether to operate on v or a cloned vector.
		 */	
		normalize: function(v, clone) 
		{
			var len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);

			if(clone)
			{
				if(len)
				{
					return [ v[0] / len,  v[1] / len,  v[2] / len];
				}
				else
				{
					return [ 0,  0,  0];
				}
			}
			else
			{
				if(len) {
					v[0] /= len;
					v[1] /= len;
					v[2] /= len;
				}

				return v;			
			}
		},
				
		/**
		 * Rotate a vector in 2 dimensions leaving the value of the other 
		 * dimension in tact.
		 *
		 * Example:
		 *
		 * rotate2D(v, 0, 1, 2, Math.PI / 2);
		 * This will rotate the vector from +ve x to +ve y.
		 * There will be no change in the z of the vector.
		 *
		 * rotate2D(v, 1, 0, 2, Math.PI / 2);
		 * This will rotate the vector from +ve y to +ve x (the
		 * opposite direction from the above example.
		 *
		 * @param v A vector.
		 * @param toAxis Defines the +ve "to" axis of the clockwise rotation.
		 * @param fromAxis Defines the +ve "from" axis of the clockwise rotation.
		 * @param angle Angle to rotate by.
		 * @param clone Whether to operate on v or a cloned vector.
		 * @returns Either v or a clone with the operation applied.
		 */
		rotate2D: function(v, fromAxis, toAxis, otherAxis, angle, clone) 
		{
			var c = Math.cos(angle);
			var s = Math.sin(angle);

			var fromAxisVal = v[fromAxis] * c - v[toAxis] * s; 
			var toAxisVal = v[fromAxis] * s - v[toAxis] * c; 

			if(clone)
			{
				var vClone = {};
				vClone[fromAxis] = fromAxisVal;
				vClone[toAxis] = toAxisVal;
				vClone[otherAxis] = v[otherAxis];
				return vClone;
			}
			else
			{
				v[fromAxis] = fromAxisVal;
				v[toAxis] = toAxisVal;
				v[otherAxis] = v[otherAxis];
				return v;
			}
		},

		/**
		 * Find the angle from an axis ignoring one component 
		 * of a vector.
		 *
		 * Example: angle2D(v, 0, 1);
		 *
		 * This will tell you the angle between the vector and 
		 * the +ve x-axis in the direction of the +ve y-axis.
		 *
		 * y,z will go from +ve y to +ve z
		 * x,z will go from +ve x to +ve z
		 *
		 * Reversing from and to gives the same result.
		 *
		 * @returns angle from 0 -> 2pi
		 */
		angle2D: function(v, fromAxis, toAxis)
		{
			if(v[toAxis] >= 0)
			{
				return Math.atan2(v[toAxis], v[fromAxis]);
			}
			else
			{
				return 2 * Math.PI + Math.atan2(v[toAxis], v[fromAxis]);
			}
		},

		/**
		 * Finds the direction of closest rotation from one vec to 
		 * another in a plane.
		 *
		 * It gives you the direction +ve/-ve, not the angle.
		 *
		 * If the shortest rotation is anticlockwise then the 
		 * result will be +ve, otherwise -ve. "clockwise" means
		 * moving from one +ve axis to another.
		 * 
		 * @param v1 The vector to rotate.
		 * @param v2 The vector to rotate towards.
		 * @param plane ('xy'|'yz'|'xz') Plane to rotate in default xy.
		 * @returns +ve if clockwise, -ve otherwise.
		 */
		directionTo2D: function(v1, v2, plane)
		{
			var normal = null;

			if(plane == 'xy') normal = [ 0,  0,  1];
			if(plane == 'yz') normal = [ 1,  0,  0];
			else if(plane == 'xz') normal = [ 0,  1,  0];

			var cross = my.cross(v1, v2, true);
			var dot = my.dot(cross, normal);
			return dot;
		},

		/**
		 * Finds the distance between two points with one of their
		 * dimensions flattened.
		 *
		 * plane is one of ('xy'|'xz'|'yz'). The value of the other
		 * dimension will be set to 0.
		 */
		distanceTo2D: function(p1, p2, plane)
		{
			var pFlat1 = [ p1[0],  p1[1],  0];
			var pFlat2 = [ p2[0],  p2[1],  0];

			if(plane == 'yz')
			{
				pFlat1 = [ 0,  p1[1],  p1[2]];
				pFlat2 = [ 0,  p2[1],  p2[2]];
			}
			else if(plane == 'xz')
			{
				pFlat1 = [ p1[0],  0,  p1[2]];
				pFlat2 = [ p2[0],  0,  p2[2]];
			}

			return my.length(my.sub(pFlat1, pFlat2, true));
		},

		/**
		 * Find the shortest angle from one vector to another.
		 *
		 * @param v1 A vector.
		 * @param v2 Another vector.
		 */	
		angleBetween: function(v1, v2)
		{
			var l1 = my.length(v1);
			var l2 = my.length(v2);

			return Math.acos(my.dot(v1, v2) / (l1 * l2));
		},
				
		/**
		 * Get a string representation of this vector.
		 */
		toString: function(v, decimals) 
		{
			decimals = decimals || 2;
			return '(' + [
				v[0].toFixed(decimals), 
				v[1].toFixed(decimals),
				v[2].toFixed(decimals)
			].join(',') + ')';
		},

		/**
		 * Compare two vectors for equality.
		 *
		 * @param v1 A vector.
		 * @param v2 Another vector.
		 * @param precision Precision (defaults to this.precision)
		 */
		equal: function(v1, v2, precision)
		{
			precision = precision || my.precision;

			var x = Math.abs(v2[0] - v1[0]);
			var y = Math.abs(v2[1] - v1[1]);
			var z = Math.abs(v2[2] - v1[2]);

			return (x < precision && y < precision && z < precision)
		},

		/**
		 * Convert radians to degrees.
		 *
		 * @param angle The angle in radians.
		 * @returns The angle in degrees.
		 */
		radToDeg: function(angle) 
		{ 
			return 360 * (angle / (2 * Math.PI));
		},

		/**
		 * Convert degrees to radians.
		 *
		 * @param angle The angle in degrees.
		 * @returns The angle in radians.
		 */
		degToRad: function(angle) 
		{
			return 2 * Math.PI * (angle / 360);
		},

		/**
		 * Dot product of two vectors.
		 *
		 * @param v1 A vector.
		 * @param v2 Another vector.
		 * @returns The dot product of the two vectors.
		 */
		dot: function(v1, v2) 
		{
			return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
		},

		/**
		 * Cross product of two vectors.
		 *
		 * @param v1 A vector.
		 * @param v2 Another vector.
		 * @returns A vector that is perpendicular to the plane defined
		 *          by the two v1tors.
		 */
		cross: function(v1, v2) 
		{
			var x = (v1[1] * v2[2]) - (v1[2] * v2[1]);
			var y = (v1[2] * v2[0]) - (v1[0] * v2[2]);
			var z = (v1[0] * v2[1]) - (v1[1] * v2[0]);

			return [x, y, z];
		},

		/**
		 * Clone a vector.
		 *
		 * @param v A vector.
		 * @returns A newly created vector with the same components.
		 */
		clone: function(v) 
		{
			return [v[0], v[1], v[2]];
		}
	};

	var my = p.vec3;

})(physii);

