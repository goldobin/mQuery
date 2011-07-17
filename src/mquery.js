/*!
 * mQuery
 *
 * Copyright 2011, Oleksandr Goldobin.
 */

var mQuery = $m = function(o) {
    return mQuery.wrap(o)
};

(function($, $m) {

var PATH_SEPARATOR = '.',
    ESCAPE_CHAR = '\\',
    ESCAPED_CHARS = [ESCAPE_CHAR, PATH_SEPARATOR, ' '];

$m.log = function(fn) {
   if ($m.log.enabled && window.console !== undefined) {
       window.console.log(fn());
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
    root: null,
    path: []
};

var ModelWrapper = function (state) {

    var self = this,
        selfState = $.extend({}, DEFAULT_MODEL_WRAPPER_STATE, state),
        isRoot = selfState.root == null || selfState.path.length == 0,
        pathHandlerMapping;

    if (isRoot) {
        selfState.root = self;
        selfState.path = [];
        selfState.relation = null;
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
            merge: function(source) {
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

                merge(this.val(), source, []);
                $.each(changedPaths, function(i, e) {
                    self.trigger(e, "change")
                });

                return this;
            },
            replace: function(nodes) {
                var self = this,
                    changedPaths = [];

                $.each(nodes, function(i, e) {
                    self.find(e.path).val(e.value);
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
            return selfState.value === undefined && (
                selfState.relation !== undefined
                        ? selfState.relation.value[selfState.relation.nameOrIndex] === undefined
                        : true);
        },
        path: function() {
            return $m.path(selfState.path);
        },
        parent: function() {
            if (this.isRoot()) {
                return null;
            }

            var path = selfState.path,
                parentPath = path.slice(0, path.length - 1);

            return this.root().find(parentPath);
        },
        val: function() {
            if (arguments.length > 0) {
                if (selfState.relation != null) {

                    if (typeof selfState.relation.value[selfState.relation.nameOrIndex] === arguments[0]) {
                        selfState.relation.value[selfState.relation.nameOrIndex] = arguments[0];
                    }
                    else {
                        $.log("Different types of values. Ignored.")
                    }
                }
                else {
                    $m.log("Value can be set only for simple type such as boolean, number or string. Ignored.");
                }
                return this;
            } else {
                return selfState.relation == null
                        ? selfState.value
                        : selfState.relation.value[selfState.relation.nameOrIndex]
            }
        },
        find: function(path) {
            var pathElements = $m.split(path);

            function virtualWrapper() {
                return new ModelWrapper({
                    root: selfState.root,
                    path: pathElements
                });
            }

            var nameOrIndex = null,
                parentValue = null,
                value = this.val();

            for (var i = 0; i < pathElements.length; i++) {

                nameOrIndex = pathElements[i];

                if (value != null) {
                    if ($.isArray(value)) {
                        nameOrIndex = parseInt(nameOrIndex);
                        if ($.isNaN(nameOrIndex)) {
                            return virtualWrapper();
                        }
                        parentValue = value;
                        value = value[nameOrIndex];
                        continue;
                    } else if (typeof value === "object" || typeof value === "function"){
                        parentValue = value;
                        value = value[nameOrIndex];
                        continue;
                    }
                }

                return virtualWrapper();
            }

            var state = {
                root: selfState.root,
                path: pathElements
            };

            if ((typeof value === "object" && value != null) || (typeof value === "function")) {
                state = $.extend(state, {
                    value: value
                });
            } else {
                state = $.extend(state, {
                    relation: {
                        nameOrIndex: nameOrIndex,
                        value: parentValue
                    }
                });
            }

            return new ModelWrapper(state);
        }
    });
};


ModelWrapper.prototype = mQuery.fn = {
    extend: jQuery.extend
};

mQuery.wrap = function(o) {
    return new ModelWrapper({ value: o });
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