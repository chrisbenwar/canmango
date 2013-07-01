'use strict';
var physii = physii || {};

(function(p) {
	/**
	 * This is not well tested or production ready.
	 */
	p.vector = {
		precision: 1e-6,
				
		serialize: function(vec) {
			return [vec.x, vec.y, vec.z];
		},

		deserialize: function(data) {
			return my.create(data[0], data[1], data[2]);
		},
				
		create: function(x, y, z) {
			if(!x) x = 0;
			if(!y) y = 0;
			if(!z) z = 0;
			return {"x": x, "y": y, "z": z};
		},

		set: function(vec, x, y, z) {
			if(!x) x = 0;
			if(!y) y = 0;
			if(!z) z = 0;
			vec.x = x;
			vec.y = y;
			vec.z = z;
		},

		fromCoords: function(v3d) {
			return my.create(v3d.x, v3d.y, v3d.z);
		},
				
		coords: function(vec, decimalPlaces, format) {
			if(decimalPlaces)
			{
				if(format == "array")
				{
					return [
						vec.x.toFixed(decimalPlaces), 
						vec.y.toFixed(decimalPlaces), 
						vec.z.toFixed(decimalPlaces)
					];
				}
				else
				{
					return {
						"x": vec.x.toFixed(decimalPlaces), 
						"y": vec.y.toFixed(decimalPlaces), 
						"z": vec.z.toFixed(decimalPlaces)
					};					
				}
			}
			else
			{
				if(format == "array")
				{
					return [vec.x, vec.y, vec.z];
				}				
				else
				{				
					return {"x": vec.x, "y": vec.y, "z": vec.z};				
				}				
			}
		},
				
		scale: function(vec, scale, makeNew) {
			if(!makeNew)
			{
				vec.x *= scale;
				vec.y *= scale;
				vec.z *= scale;
				return vec;
			}
			else
			{
				return {"x": vec.x * scale, "y": vec.y * scale, "z": vec.z * scale};
			}
		},
				
		add: function(vec, vec2, makeNew) {
			if(!makeNew)
			{
				vec.x += vec2.x;
				vec.y += vec2.y;
				vec.z += vec2.z;
				return vec;
			}
			else
			{
				return {"x": vec.x + vec2.x, "y": vec.y + vec2.y, "z": vec.z + vec2.z};
			}
		},
				
		sub: function(vec, vec2, makeNew) {
			if(!makeNew)
			{
				vec.x -= vec2.x;
				vec.y -= vec2.y;
				vec.z -= vec2.z;
				return vec;
			}
			else
			{
				return {"x": vec.x - vec2.x, "y": vec.y - vec2.y, "z": vec.z - vec2.z};
			}
		},
				
		resist: function(vec, vec2) {
			if(vec.x > 0) vec.x -= vec2.x;
			else if(vec.x < 0) vec.x += vec2.x;

			if(vec.y > 0) vec.y -= vec2.y;
			else if(vec.y < 0) vec.y += vec2.y;

			if(vec.z > 0) vec.z -= vec2.z;
			else if(vec.z < 0) vec.z += vec2.z;			
		},

		/*
			* The projection is the portion of vVector in the same direction as this
			*
			*
			*/
		projectionOf: function(vec, vVector)
		{
			var N = my.normalize(vec, true);
			my.scale(N, my.dot(vVector, N));
			return N;
		},
				
		/*
			* The rejection is the portion of vVector orthogonal to this
			*/
		rejectionOf: function(vec, vVector)
		{
			var N = my.normalize(vec, true);
			var rejection = my.sub(vVector, my.projectionOf(vec, vVector), true);
			return rejection;
		},

		bounce: function(vec, normal)
		{
			var N = my.normalize(normal, true); 
			var V = my.clone(vec);

			my.scale(N, -2 * my.dot(V, N));
			my.add(N, V);

			return N;
		},

		bounceZ: function(vec)
		{
			var V = my.clone(vec);
			V.z = -V.z;
			return V;
		},

		negate: function(vec, makeNew) {
			if(!makeNew)
			{
				vec.x = -vec.x;
				vec.y = -vec.y;
				vec.z = -vec.z;
				return vec;
			}
			else
			{
				return {"x": -vec.x, "y": -vec.y, "z": -vec.z};	
			}
		},
				
		length: function(vec) {
			return Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
		},
				
		lengthSquared: function(vec) {
			return vec.x * vec.x + vec.y * vec.y + vec.z * vec.z;
		},
				
		normalize: function(vec, makeNew) {
			var len = Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);

			if(!makeNew)
			{
				if(len) {
					vec.x /= len;
					vec.y /= len;
					vec.z /= len;
				}

				return vec;			
			}
			else
			{
				if(len)
				{
					return {"x": vec.x / len, "y": vec.y / len, "z": vec.z / len};
				}
				else
				{
					return {"x": 0, "y": 0, "z": 0};
				}
			}
		},
				
		setLengthXY: function(vec, val, makeNew) {
			var z = vec.z; 

			if(makeNew)
			{
				return my.scale(my.normalize(my.flattenZ(vec, true), val));
			}
			else
			{
				my.scale(my.normalize(my.flattenZ(vec)), val);
				vec.z = z;
				return vec;
			}
		},
				
		getLengthXY: function(vec) { 
			return my.length(my.flattenZ(vec, true));
		},
				
		directionXY: function(vec) {
			if(vec.y >= 0)
			{
				return Math.atan2(vec.y, vec.x);
			}
			else
			{
				return (Math.PI + Math.atan2(vec.y, vec.x)) + Math.PI;
			}

			return direction;
		},
				
		directionXZ: function(vec) { 
			if(vec.z >= 0)
			{
				return Math.atan2(vec.z, vec.x);
			}
			else
			{
				return (Math.PI + Math.atan2(vec.z, vec.x)) + Math.PI;
			}

			return direction;
		},

		rotateXY: function(vec, angle, makeNew) {
			var x = vec.x;
			var y = vec.y;

			var cosVal = Math.cos(angle);
			var sinVal = Math.sin(angle);

			if(!makeNew)
			{
				vec.x = x * cosVal - y * sinVal;
				vec.y = x * sinVal + y * cosVal;	
				return vec;
			}
			else
			{
				return {"x": x * cosVal - y * sinVal, "y": x * sinVal + y * cosVal, "z": vec.z};	
			}
		},
				
		rotateXZ: function(vec, angle, makeNew) {
			var x = vec.x;
			var z = vec.z;

			var cosVal = Math.cos(angle);
			var sinVal = Math.sin(angle);

			if(!makeNew)
			{
				vec.x = x * cosVal - z * sinVal;
				vec.z = x * sinVal + z * cosVal;	
				return vec;
			}
			else
			{
				return {"x": x * cosVal - z * sinVal, "y": vec.y, "z": x * sinVal + z * cosVal};
			}
		},

		rotateYZ: function(vec, angle, makeNew) {
			var y = vec.y;
			var z = vec.z;

			var cosVal = Math.cos(angle);
			var sinVal = Math.sin(angle);

			if(!makeNew)
			{
				vec.y = y * cosVal - z * sinVal;
				vec.z = y * sinVal + z * cosVal;	
				return vec;
			}
			else
			{
				return {"x": vec.x, "y": y * sinVal + z * cosVal, "z": y * cosVal - z * sinVal};
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
		toString: function(vec) {
			return '(' + vec.x.toFixed(3) + ',' + vec.y.toFixed(3) + ',' + vec.z.toFixed(3) + ')';
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

		/**
		 * See if one component of a vector is the same as another
		 * to within a precision.
		 *
		 * @param vec 1st vector.
		 * @param vVec 2nd vector.
		 * @param axis (x|y|z) String representing the axis.
		 * @param precision Precision to use. Defaults to this.precision.
		 *
		 * @returns boolean If the component is equal to within precision.
		 */
		axisEquals: function(vec, vVec, axis, precision) {
			var precision = precision || my.precision;

			return Math.abs(vec[axis] - vVec[axis]) < precision;
		},

		/**
		 * See if a vector is the same as another to within a precistion.
		 *
		 * @param vec 1st vector.
		 * @param vVec 2nd vector.
		 * @param precision Precision to use. Defaults to this.precision.
		 *
		 * @returns boolean If the component is equal to within precision.
		 */
		equals: function(vec, vVec, precision) {
			return 
				vec.axisEquals(vVec, 'x', precision) && 
				vec.axisEquals(vVec, 'y', precision) && 
				vec.axisEquals(vVec, 'z', precision);
		},

		/**
		 * This puts a point on the opposite side of rectangle
		 * by changing both the x and y components.
		 */
		flipPointX: function(vPoint, vBounds, makeNew) {
			if(makeNew)
			{
				return my.create(vBounds.x - vPoint.x, vBounds.y - vPoint.y, vPoint.z);
			}
			else
			{
				vPoint.x = vBounds.x - vPoint.x;
				vPoint.y = vBounds.y - vPoint.y;
			}
		},

		/**
		 * This function tells you what perpendicular acceleration is required
		 * to deviate a path by a given angle at a given distance.
		 * 
		 * The length of vVel is used purely to get the speed. Distance is 
		 * to be in the direction of the velocity.
		 * 
		 * There will be a divide by 0 error if vVel is 0 or d is 0.
		 */
		angleToAccel: function(vVel, d, targetAngle) {
			var div = d / my.length(vVel);
			return (2 * d * Math.tan(targetAngle) ) / (div * div);
		},

		/**
		 * Change a vector into a different xy coord system.
		 */
		toLocalXY: function(vLocalOrigin, vLocalDirection, v, isVelocity, makeNew) {
			var vToChange = v;
			if(makeNew)
			{
				vToChange = my.clone(v);
			}
			
			if(!isVelocity)
			{
				my.sub(vToChange, vLocalOrigin);			
			}

			var direction = my.directionXY(vLocalDirection);

			my.rotateXY(vToChange, -direction); 
			
			return vToChange;
		}
	};

	var my = p.vector;

})(physii);

