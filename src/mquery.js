/*!
 * mQuery
 *
 * Copyright 2011, Oleksandr Goldobin.
 */

var mQuery = $m = function() {

    if (arguments.length > 0) {
        return mQuery.wrap(arguments[0]);
    }

    return mQuery.wrap();
};

(function($, $m) {


var settings = {
    consoleEnabled: false
};

$m.settings = function(opts) {
    $.each(opts, function(k, e) {
        if ($.isFunction($m.settings[k])) {
            ($m.settings[k])(e);
        }
        return true;
    })
};

$.each(settings, function(k, e) {
    $m.settings[k] = function() {
        if (arguments.length > 0) {
            if (typeof arguments[0] === typeof settings[k]) {
                var value;
                if ($.isArray(arguments[0])) {
                    value = $([], arguments[0]);
                } else if ($.isPlainObject(arguments[0])){
                    value = $({}, arguments[0]);
                } else {
                    value = arguments[0];
                }
                settings[k] = value;
            } else {
                $m.withConsole(function() {
                    this.error("Expecting \"" + typeof arguments[0] + "\" as an argument. Assignment ignored.");
                })
            }
        }
        else {
            return settings[k];
        }
    }
});

var PATH_SEPARATOR = '.',
    ESCAPE_CHAR = '\\',
    ESCAPED_CHARS = [ESCAPE_CHAR, PATH_SEPARATOR, ' '];


$m.withConsole = function(fn) {
    if (settings.consoleEnabled && typeof console !== undefined) {
        $.proxy(fn, console)();
    }
};

$m.split = function(path) {
    var elements = [], buff = '',
        escapeState = false,
        i = 0, ch;

    for (; i < path.length; i++) {
        ch = path.charAt(i);

        if (escapeState) {
            if ($.inArray(ch, ESCAPED_CHARS) == -1) {
                return elements;
            }
            buff += ch;
            escapeState = false;
        }
        else {
            if (ch == PATH_SEPARATOR) {
                if (buff.length == 0) {
                    return elements;
                } else {
                    elements.push(buff);
                    buff = '';
                }
            } else if (ch == ESCAPE_CHAR) {
                escapeState = true;
            } else {
                buff += ch;
            }
        }
    }
    if (buff.length > 0) {
        elements.push(buff);
    }

    return elements;
};

$m.escape = function(segment) {
    var buff = '', i = 0, ch;
    for (; i < segment.length; i++) {
        ch = segment.charAt(i);
        if ($.inArray(ch, ESCAPED_CHARS) > -1) {
            buff += ESCAPE_CHAR;
        }
        buff += ch;
    }
    return buff;
};

$m.path = function(arr) {
    var buff = '';
    $.each(arr, function() {
        if (this.length == 0) {
            return false;
        }
        if (buff.length > 0) {
            buff += PATH_SEPARATOR;
        }
        buff += $m.escape(this);
    });
    return buff;
};

var EVENT_ALIASES = [
    "appear",
    "disappear",
    "change"
];

var DEFAULT_MODEL_WRAPPER_STATE = {
    root: undefined,
    path: []
};

var ModelWrapper = function (state) {

    var self = this,
        selfState = $.extend({}, DEFAULT_MODEL_WRAPPER_STATE, state),
        isRoot = selfState.root === undefined || selfState.path.length == 0,
        pathHandlerMapping;

    if (isRoot) {
        selfState.root = self;
        selfState.path = [];
        pathHandlerMapping = {};

        self.extend({
            bind: function() {
                var path, eventName, fn;

                if (arguments.length == 3) {
                    path = arguments[0];
                    eventName = arguments[1];
                    fn = arguments[2];
                } else if (arguments.length == 2) {
                    eventName = arguments[0];
                    path = "";
                    fn = arguments[1];
                } else {
                    return this;
                }

                if (!$.isFunction(fn)) {
                    return this;
                }

                var eventNameHandlerMapping = pathHandlerMapping[path];

                if (eventNameHandlerMapping === undefined) {
                    eventNameHandlerMapping = {};
                    pathHandlerMapping[path] = eventNameHandlerMapping;
                }

                var handlerSet = eventNameHandlerMapping[eventName];

                if (handlerSet ===  undefined) {
                    handlerSet = [];
                    eventNameHandlerMapping[eventName] = handlerSet;
                }

                if ($.inArray(fn, handlerSet) == -1) {
                     handlerSet.push(fn);
                }

                return this;
            },
            trigger: function() {
                var path, eventName, eventParams;

                if (arguments.length == 3) {
                    path = arguments[0];
                    eventName = arguments[1];
                    eventParams = arguments[2];
                } else if (arguments.length == 2) {
                    path = arguments[0];
                    eventName = arguments[1];
                } else {
                    return this;
                }

                $.each(pathHandlerMapping, function(eventPath, eventNameHandlerMapping) {
                    if (path.indexOf(eventPath) != 0) {
                        return true;
                    }
                    var handlerSet = eventNameHandlerMapping[eventName];
                    if (handlerSet == null) {
                        return true;
                    }

                    var callContext = self.find(eventPath);

                    if (callContext.isVirtual()) {
                        return true;
                    }

                    $.each(handlerSet, function(i, fn) {
                        $.proxy(fn, callContext)(eventParams);
                    })
                });

                return this;
            },
            merge: function() {

                if (arguments.length == 0) {
                    return this;
                }

                $.each(arguments, function(i, argument) {
                    if (typeof argument !== "object" ||
                        !($.isPlainObject(argument) || $.isArray(argument))) {
                        throw "Only plain objects and arrays are acceptable";
                    }
                });

                var self = this,
                    changedPaths = [];

                function merge(target, source, path) {
                    var src, clone, copy, copyIsArray, clonedPath;

                    for (var name in source) {
                        src = target[ name ];
                        copy = source[ name ];

                        // Prevent never-ending loop
                        if ( target === copy ) {
                            continue;
                        }

                        clonedPath = path.slice(0, path.length);
                        clonedPath.push(name);

                        // Make recursion if we're merging plain objects or arrays
                        if (copy && ( $.isPlainObject(copy) || (copyIsArray = $.isArray(copy)) ) ) {
                            if ( copyIsArray ) {
                                copyIsArray = false;
                                clone = src && $.isArray(src) ? src : [];
                            } else {
                                clone = src && $.isPlainObject(src) ? src : {};
                            }

                            // Never move original objects, clone them

                            target[ name ] = merge(
                                    clone,
                                    copy,
                                    clonedPath);

                        // Don't bring in undefined values
                        } else if ( copy !== undefined ) {

                            if (target[ name ] != copy) {
                                changedPaths.push($m.path(clonedPath));
                            }
                            target[ name ] = copy;
                        }
                    }

                    return target;
                }

                $.each(arguments, function(i, argument) {
                    merge(selfState.relation.parentRef[selfState.relation.nameOrIndex], argument, []);
                });

                $.each(changedPaths, function(i, e) {
                    self.trigger(e, "change")
                });

                return this;
            },
            replace: function(nodes) {
                var self = this,
                    changedPaths = [];

                $.each(nodes, function(i, e) {
                    var node = self.find(e.path);
                    node.val(e.value);
                    changedPaths.push(e.path);
                });

                $.each(changedPaths, function(i, e) {
                    self.trigger(e, "change")
                });
            },
            update: function(data) {
                if (data["merge"] !== undefined) {
                    self.merge(data["merge"]);
                }
                if (data["replace"] !== undefined) {
                    self.replace(data["replace"]);
                }
            }
        })
    } else {
        self.extend({
            bind: function(eventName, fn) {
                this.root().bind(this.path(), eventName, fn);
                return this;
            },
            trigger: function(eventName, eventParams) {
                this.root().trigger(this.path(), eventName, eventParams);
                return this;
            }
        });
    }

    $.each(EVENT_ALIASES, function(i, eventName) {
        self[eventName] = function(handlerOrEventParams) {
            if ($.isFunction(handlerOrEventParams)) {
                return this.bind(eventName, handlerOrEventParams);
            } else {
                return this.trigger(eventName, handlerOrEventParams);
            }
        }
    });

    self.extend({
        root : function() {
            return selfState.root;
        },
        isRoot: function() {
            return selfState.path.length == 0;
        },
        isVirtual: function() {
            return selfState.relation === undefined || selfState.relation.parentRef[selfState.relation.nameOrIndex] === undefined;
        },
        path: function() {
            return $m.path(selfState.path);
        },
        parent: function() {
            if (this.isRoot()) {
                return undefined;
            }

            var path = selfState.path,
                parentPath = path.slice(0, path.length - 1);

            return this.root().find(parentPath);
        },
        __plainVal__: function() {
            if (arguments.length > 0) {
                selfState.relation.parentRef[selfState.relation.nameOrIndex] = arguments[0];
            }
            else {
                return selfState.relation.parentRef[selfState.relation.nameOrIndex];
            }
        },
        val: function() {

            if (this.isVirtual()) {
                if (arguments.length > 0) {
                    throw "Can't assign value for virtual wrapper.";
                } else {
                    return undefined;
                }
            }

            if (arguments.length > 0) {
                var origValue = this.__plainVal__(),
                    newValue = arguments[0];

                if (typeof origValue !== typeof newValue) {
                    throw "Different value types.";
                }

                if ($.isArray(origValue)) {
                    if (!$.isArray(newValue)) {
                        throw "Different value types.";
                    }
                    this.__plainVal__($.extend(true, [], newValue));
                    return this;
                }

                if (typeof origValue === "object") {
                    if (!$.isPlainObject(newValue)) {
                        throw "Object is not plain object.";
                    }
                    this.__plainVal__($.extend(true, {}, newValue));
                    return this;
                }

                this.__plainVal__(newValue);
                return this;
            } else {
                var ref = this.__plainVal__();

                if ($.isArray(ref)) {
                    return $.extend(true, [], ref);
                }

                if ($.isPlainObject(ref)) {
                    return $.extend(true, {}, ref);
                }

                return ref;
            }
        },
        find: function(path) {
            var pathElements = $m.split(path);

            if (pathElements.length == 0) {
                return this;
            }

            function virtualWrapper() {
                return new ModelWrapper({
                    root: selfState.root,
                    path: pathElements
                });
            }

            var nameOrIndex,
                parentRef,
                value = this.__plainVal__();

            for (var i = 0; i < pathElements.length; i++) {

                nameOrIndex = pathElements[i];

                if (value !== undefined) {
                    if ($.isArray(value)) {
                        nameOrIndex = parseInt(nameOrIndex);
                        if ($.isNaN(nameOrIndex)) {
                            return virtualWrapper();
                        }
                        parentRef = value;
                        value = value[nameOrIndex];
                        continue;
                    } else if ($.isPlainObject(value)){
                        parentRef = value;
                        value = value[nameOrIndex];
                        continue;
                    }
                }

                return virtualWrapper();
            }

            if (nameOrIndex === undefined || parentRef === undefined) {
                return virtualWrapper();
            } else {
                return new ModelWrapper({
                    root: selfState.root,
                    path: pathElements,
                    relation: {
                        nameOrIndex: nameOrIndex,
                        parentRef: parentRef
                    }
                });
            }
        }
    });
};


ModelWrapper.prototype = $m.fn = {
    extend: jQuery.extend
};

$m.wrap = function() {

    var o;
    if (arguments.length > 0) {
        var exceptionMessage = "Only plain objects and arrays are acceptable";

        if (typeof arguments[0] !== "object") {
            throw exceptionMessage;
        }

        var ref = arguments[0];

        if ($.isPlainObject(ref)) {
            o = $.extend(true, {}, ref);
        } else if ($.isArray(ref)) {
            o = $.extend(true, [], ref);
        } else {
            throw exceptionMessage;
        }
    }
    else {
        o = {}
    }

    return new ModelWrapper({
        relation: {
            nameOrIndex: "root",
            parentRef: {root: o}
        }
    });
};

})(jQuery, mQuery);

(function($) {

var DEFAULT_SINGLE_INPUT_SETTINGS =  {
    get: function() {
        return $(this).val();
    },
    set: function(value) {
          $(this).val(value)
    },
    change: function(fn) {
        $(this).change(fn)
    }
};

var DEFAULT_GROUPED_INPUT_SETTINGS = {
    groupId: function() {
        return $(this).attr("name");
    },
    get: function(group) {
        var value;
        $.each(group, function(i, e) {
            if ($(e).is(":checked")) {
                value = $(e).val();
                return false;
            }
        });

        return value;
    },
    set: function(group, value) {
        $.each(group, function(i, e) {
            $(e).attr("checked", $(e).val() == value);
        });
    },
    change: function(group, fn) {
        $.each(group, function(i, e) {
            $(e).change(fn);
        });
    }
};

var inputs = [];

$.bindTo = {
    singleInput: function(applicableFn, opts) {
        inputs.push({
            type: "single",
            applicable: applicableFn,
            settings: $.extend({}, DEFAULT_SINGLE_INPUT_SETTINGS, opts)
        })
    },
    groupedInput: function(applicableFn, opts) {
        inputs.push({
            type: "grouped",
            applicable: applicableFn,
            settings: $.extend({}, DEFAULT_GROUPED_INPUT_SETTINGS, opts)
        })
    }
};

$.bindTo.singleInput(function() {
    return $(this).is("input[type=text]")
}, {
    change: function(fn) {
        $(this).keyup(fn)
    }
});

$.bindTo.singleInput(function() {
    return $(this).is("select")
}, {});

$.bindTo.singleInput(function() {
    return $(this).is("input:checkbox")
}, {
    get: function() {
        return $(this).is(":checked")
    },
    set: function(value) {
        $(this).attr("checked", value === true);
    }
});

$.bindTo.groupedInput(function() {
    return $(this).is("input:radio")
}, {});

function mapObject(o, fn) {
    var result = {};

    $.each(o, function(k, v) {
        result[k] = fn(v);
    });

    return result;
}

$.fn.bindTo = function(model, formatFn) {

    var formattedValue = $.isFunction(formatFn)
            ? function () {
                return formatFn(model.val());
            }
            : function () {
                return model.val();
            },
        inputProxies = [],
        inputGroups = {};

    this.each(function() {
        var self = this, inputFound = false;

        $.each(inputs, function(i, e) {
            if (!$.proxy(e.applicable, self)()) {
                return true;
            }

            inputFound = true;
            var proxies = mapObject(e.settings, function(e) {
                return $.proxy(e, self);
            });

            if (e.type == "single") {
                inputProxies.push(proxies);
            } else if (e.type == "grouped") {
                var id = (proxies["groupId"])(),
                    group = inputGroups[id];

                if (group === undefined) {
                    group = [];
                    inputProxies.push(
                        mapObject(proxies, function(e) {
                            return function() {
                                if (arguments.length > 0) {
                                    return e(group, arguments[0]);
                                }
                                return e(group);
                            }
                        }));
                    inputGroups[id] = group;
                }

                group.push(self);
            }

            return false;
        });

        if (!inputFound) {
            var element = $(this);
            inputProxies.push({
                set: function(value) {
                    element.html(value);
                }
            });
        }
    });


    $.each(inputProxies, function(i, proxies) {
        var guard = {};

        function applyInputValue() {
            var value = formattedValue();
            (proxies["set"])(value);
        }

        applyInputValue();

        model.change(function(e) {
            if (e != guard) {
                applyInputValue()
            }
        });

        if ($.isFunction(proxies["change"])) {
            (proxies["change"])(function() {
                var value = (proxies["get"])();
                model
                .val(value)
                .change(guard);
            });
        }
    });

    return this;
};

})(jQuery);