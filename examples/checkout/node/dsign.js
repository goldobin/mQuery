
var each = exports.each = function(o, fn) {
        var name, i = 0,
			length = o.length,
			isObject = length === undefined || isFunction(o);

        if (isObject) {
            for (name in o) {
                if (fn(name, o[ name ]) === false) {
                    break;
                }
            }
        } else {
            for (; i < length; i++) {
                if (fn(i, o[ i ]) === false) {
                    break;
                }
            }
        }

		return o;
    },
    transform = exports.transform = function(o, fn) {
        var result = {};
        for (var key in o) {
            result[key] = fn(key, o[key])
        }
    },
    map = function (a, fn) {
		var result = [], i, value;

		for (i in a) {
			value = fn(a[ i ], i);
			if ( value != null ) {
				result.push(value);
			}
		}

		return result.concat.apply( [], result );
	},
    isFunction = exports.isFunction = function(o) {
        return o != null && typeof o === "function";
    },
    isArray = exports.isArray = function(o) {
        return o != null && typeof o  === "array";
    },
    isPlainObject = exports.isPlainObject == function(o) {
        var hasOwn = Object.prototype.hasOwnProperty;

		if ( o.constructor &&
			!hasOwn.call(o, "constructor") &&
			!hasOwn.call(o.constructor.prototype, "isPrototypeOf") ) {
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.

		var key;
		for (key in o) {}

		return key === undefined || hasOwn.call( o, key );
    },
    extend = exports.extend = function() {

        var options,
            name,
            src,
            copy,
            copyIsArray,
            clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        // Handle a deep copy situation
        if (typeof target === "boolean") {
            deep = target;
            target = arguments[1] || {};
            // skip the boolean and the target
            i = 2;
        }

        // Handle case when target is a string or something (possible in deep copy)
        if (typeof target !== "object" && !isFunction(target)) {
            target = {};
        }

        for (; i < length; i++) {
            // Only deal with non-null/undefined values
            if ((options = arguments[ i ]) != null) {
                // Extend the base object
                for (name in options) {
                    src = target[ name ];
                    copy = options[ name ];

                    // Prevent never-ending loop
                    if (target === copy) {
                        continue;
                    }

                    // Recurse if we're merging plain objects or arrays
                    if (deep && copy && ( isPlainObject(copy) || (copyIsArray = isArray(copy)) )) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && isArray(src) ? src : [];

                        } else {
                            clone = src && isPlainObject(src) ? src : {};
                        }

                        // Never move original objects, clone them
                        target[ name ] = extend(deep, clone, copy);

                        // Don't bring in undefined values
                    } else if (copy !== undefined) {
                        target[ name ] = copy;
                    }
                }
            }
        }

        // Return the modified object
        return target;
    };
