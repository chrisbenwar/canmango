'use strict';
var physii = physii || {};

(function(p) {
	/**
	 * Functions for creating and manipulating vectors.
	 *
	 * Vectors are stored in format {"x": xVal, "y": yVal, "z": zVal}
	 *
	 * This is not well tested or production ready.
	 *
	 * Based on Physics for Game Developers by David M Bourg but 
	 * with a few extra treats thrown in.
	 */
	p.vector = 
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

			return {"x": x, "y": y, "z": z};
		},

		/**
		 * Convert from {"x": xVal, "y": yVal, "z": zVal} to
		 * [xVal, yVal, zVal]
		 */			
		toArray: function(v) 
		{
			return [v.x, v.y, v.z];
		},

		/**
		 * Convert from [xVal, yVal, zVal] to
		 * {"x": xVal, "y": yVal, "z": zVal}
		 */			
		fromArray: function(vArr) 
		{
			var x = vArr[0] || 0;
			var y = vArr[1] || 0;
			var z = vArr[2] || 0;

			return {"x": x, "y": y, "z": z};
		},

		/**
		 * Shorthand for setting x, y and z for a vector.
		 *
		 * @returns A reference to the vector.
		 */
		set: function(v, x, y, z) 
		{
			v.x = x || 0; 
			v.y = y || 0; 
			v.z = z || 0;
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
			if(!clone)
			{
				v.x *= factor;
				v.y *= factor;
				v.z *= factor;
				return v;
			}
			else
			{
				return {"x": v.x * factor, "y": v.y * factor, "z": v.z * factor};
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
		add: function(v, v2, clone) {
			if(!clone)
			{
				v.x += v2.x;
				v.y += v2.y;
				v.z += v2.z;
				return v;
			}
			else
			{
				return {"x": v.x + v2.x, "y": v.y + v2.y, "z": v.z + v2.z};
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
		sub: function(v, v2, clone) {
			if(!clone)
			{
				v.x -= v2.x;
				v.y -= v2.y;
				v.z -= v2.z;
				return v;
			}
			else
			{
				return {"x": v.x - v2.x, "y": v.y - v2.y, "z": v.z - v2.z};
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
		negate: function(v, clone) {
			if(!clone)
			{
				v.x = -v.x;
				v.y = -v.y;
				v.z = -v.z;
				return v;
			}
			else
			{
				return {"x": -v.x, "y": -v.y, "z": -v.z};	
			}
		},
				
		/**
		 * Find the length of a vector.
		 */
		length: function(v) {
			return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
		},

		/**
		 * Find the square of the length of a vector. To save
		 * doing a square root if it is needed for some physical
		 * calculation.
		 *
		 * @param v A vector.
		 */	
		lengthSquared: function(v) {
			return v.x * v.x + v.y * v.y + v.z * v.z;
		},
				
		/**
		 * Normalize a vector (give it length of 1 unit).
		 *
		 * @param v A vector.
		 * @param clone Whether to operate on v or a cloned vector.
		 */	
		normalize: function(v, clone) {
			var len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);

			if(!clone)
			{
				if(len) {
					v.x /= len;
					v.y /= len;
					v.z /= len;
				}

				return v;			
			}
			else
			{
				if(len)
				{
					return {"x": v.x / len, "y": v.y / len, "z": v.z / len};
				}
				else
				{
					return {"x": 0, "y": 0, "z": 0};
				}
			}
		},
				

		/**
		 * Rotate a vector in 2 dimensions leaving the value of the other 
		 * dimension in tact.
		 *
		 * Example:
		 *
		 * rotate2D(v, 'x', 'y', 'z', Math.PI / 2);
		 * This will rotate the vector from +ve x to +ve y.
		 * There will be no change in the z of the vector.
		 *
		 * rotate2D(v, 'y', 'x', 'z', Math.PI / 2);
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
		rotate2D: function(v, fromAxis, toAxis, otherAxis, angle, clone) {
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
		 * Example: direction2D(v, 'x', 'y');
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
		direction2D: function(v, fromAxis, toAxis)
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
		 * Finds the direction from one vec to another rotating
		 * around the z axis.
		 *
		 * If the shortest rotation is anticlockwise then the 
		 * result will be +ve, otherwise -ve.
		 * 
		 * @param v1 The vector to rotate.
		 * @param v2 The vector to rotate towards.
		 * @returns +ve if clockwise, -ve otherwise.
		 */
		xyDirectionTo: function(v1, v2)
		{
			var planeNormal = {"x": 0, "y": 0, "z": 1};
			var cross = my.cross(v1, v2, true);
			var dot = my.dot(cross, planeNormal);
			return dot;
		},
				
		/**
		 * Finds the direction from one vec to another rotating
		 * around the y axis.
		 *
		 * If the shortest rotation is anticlockwise then the 
		 * result will be +ve, otherwise -ve.
		 * 
		 * @param v1 The vector to rotate.
		 * @param v2 The vector to rotate towards.
		 * @returns +ve if clockwise, -ve otherwise.
		 */
		xzDirectionTo: function(vec, vVec)
		{
			var planeNormal = {"x": 0, "y": 1, "z": 0};
			var cross = my.cross(vec, vVec, true);
			var dot = my.dot(cross, planeNormal);
			return dot;
		},
				
		/**
		 * Finds the distance between two points in the xy
		 * plane.
		 *
		 * It takes two vectors, removes the z-component and then 
		 * finds the distance.
		 *
		 * @param vP1 Point 1.
		 * @param vP2 Point 2.
		 * @returns The distance.
		 */
		xyDistanceTo: function(vP1, vP2)
		{
			var flattened = my.flattenZ(vP1, true);
			var flattenedPoint = my.flattenZ(vP2, true);
			var subbed = my.sub(flattened, flattenedPoint, true);
			return my.length(subbed);
		},
				
		/**
		 * Finds the distance between two points in the xz
		 * plane.
		 *
		 * It takes two vectors, removes the y-component and then 
		 * finds the distance.
		 *
		 * @param vP1 Point 1.
		 * @param vP2 Point 2.
		 * @returns The distance.
		 */
		xzDistanceTo: function(vP1, vP2)
		{
			var flattened = my.flattenY(vP1, true);
			var flattenedPoint = my.flattenY(vP2, true);
			var subbed = my.sub(flattened, flattenedPoint, true);
			return my.length(subbed);
		},
				
		flattenZ: function(vec, makeNew)
		{
			if(makeNew)
			{
				return {"x": vec.x, "y": vec.y, "z": 0};
			}
			else
			{
				vec.z = 0;
				return vec;
			}
		},
				
		flattenY: function(vec, makeNew)
		{
			if(makeNew)
			{
				return {"x": vec.x, "y": 0, "z": vec.z};
			}
			else
			{
				vec.y = 0;
				return vec;
			}
		},
				
		/*
		 * Finds shortest angle between two vectors
		 * 
		 * Will return Nan if one vec has no length
		 */
		angleTo: function(vec, vVector)
		{			
			var val = my.dot(vec, vVector) / (my.length(vec) * my.length(vVector)); 
			var angle = Math.acos(val);
			return angle;
		},
				
		/**
		 * Rotate a vector through an angle in z.
		 */
		rotateZ: function(vec, angle, makeNew) {
			var length = my.length(vec);
			var direction = my.directionXY(vec);

			var newZ = length * Math.sin(angle);

			var newX  = length * Math.cos(angle);
			var newY = 0;

			var newVec = {"x": newX, "y": newY, "z": newZ};

			my.rotateXY(newVec, direction);

			if(!makeNew)
			{
				vec.x = newVec.x;
				vec.y = newVec.y;
				vec.z = newVec.z;
				return vec;
			}
			else
			{
				return newVec;
			}
		},

		/**
		 * Get a string representation of this vector.
		 */
		toString: function(v, decimals) 
		{
			decimals = decimals || 2;
			return '(' + [
				v.x.toFixed(decimals), 
				v.y.toFixed(decimals),
				v.z.toFixed(decimals)
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
debugger; 
			var x = Math.abs(v2.x - v1.x);
			var y = Math.abs(v2.y - v1.y);
			var z = Math.abs(v2.z - v1.z);

			return (x < precision && y < precision && z < precision)
		},

		/**
		 * Convert radians to degrees.
		 *
		 * @param angle The angle in radians.
		 * @returns The angle in degrees.
		 */
		radToDeg: function(angle) { 
			return (angle / (Math.PI * 2)) * 360;
		},

		/**
		 * Convert degrees to radians.
		 *
		 * @param angle The angle in degrees.
		 * @returns The angle in radians.
		 */
		degToRad: function(angle) {
			return (angle / 360) * (Math.PI * 2);
		},

		/**
		 * Get the dot product of two vectors.
		 *
		 * One use of the dot product is to find the projection
		 * of one vector on to another (to find the amount of one
		 * vector that points in the same direction as the other).
		 *
		 * @param vec The first vector.
		 * @param vec2 The second vector.
		 * @returns The dot product of the two vectors.
		 */
		dot: function(vec, vec2) {
			return vec.x * vec2.x + vec.y * vec2.y + vec.z * vec2.z;
		},

		/**
		 * Get the cross product of two vectors.
		 *
		 * The cross product creates a vector which is perpendicular
		 * to the other two vectors.
		 *
		 * @param vec The first vector.
		 * @param vec2 The second vector.
		 * @param makeNew Whether to change vec or make a new vector.
		 * @returns The cross product vector.
		 */
		cross: function(vec, vec2, makeNew) {
			var x = (vec.y * vec2.z) - (vec.z * vec2.y);
			var y = (vec.z * vec2.x) - (vec.x * vec2.z);
			var z = (vec.x * vec2.y) - (vec.y * vec2.x);
			if(makeNew)
			{
				return {"x": x, "y": y, "z": z};
			}
			else
			{
				vec.x = x;
				vec.y = y;
				vec.z = z;
				return vec;
			}
		},

		/**
		 * Creates a copy of a vector.
		 *
		 * @param vec The vector to clone.
		 * @returns The cloned vector.
		 */
		clone: function(vec) {
			return {"x": vec.x, "y": vec.y, "z": vec.z};
		},
	};

	var my = p.vector;

})(physii);

