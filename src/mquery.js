/*!
 * mQuery
 *
 * Copyright 2011, Oleksandr Goldobin.
 */

var mQuery = $m = function(o) {
    return mQuery.wrap(o)
};

(function($, $m) {

var PATH_SEPARATOR = '.';
var ESCAPE_CHAR = '\\';
var ESCAPED_CHARS = [ESCAPE_CHAR, PATH_SEPARATOR, ' '];

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
                } else if (arguments.length == 3) {
                    eventName = arguments[0];
                    path = "";
                    eventParams = arguments[1];
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
                    changes = [];

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

                        // Recurse if we're merging plain objects or arrays
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
                                changes.push({
                                    path: clonedPath,
                                    value: copy
                                });
                            }
                            target[ name ] = copy;
                        }
                    }

                    return target;
                }

                merge(this.val(), source, []);
                $.each(changes, function(i, e) {
                    var path = $m.path(e.path);
                    self.trigger(path, "change", {
                        path: path,
                        value: e.value
                    })
                });

                return this;
            }
        });
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
                    selfState.relation.value[selfState.relation.nameOrIndex] = arguments[0];
                    return this;
                }
                else {
                    throw "Value can be set only to the simple type such as number and string";
                }
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

(function($, $m) {


var MODEL_DATA_KEY = "MODEL_DATA";

$.fn.extend({

    model: function() {
        var self = $(this),
            selfData = self.data(MODEL_DATA_KEY);

        if (selfData == null) {
            selfData = $m({});
            self.data(MODEL_DATA_KEY, selfData);
        }

        return selfData;
    },
    modelAjax: function(opts) {
        var self = this;
        $.ajax($.extend({}, opts, {
            dataType: opts.dataType == "json" || opts.dataType == "jsonp"
                    ? opts.dataType
                    : "json",
            error: function(request, textStatus, errorThrown) {
                if ($.isFunction(opts.error)) {
                    opts.error(request, textStatus, errorThrown);
                }
            },
            success: function(data /*, textStatus, request*/) {

                if (data == null || data["update"] === undefined) {
                    return;
                }

                self.model().merge(data["update"]);

                if ($.isFunction(opts.success)) {
                    opts.success(data);
                }
            }
        }));
        return this;
    }
});

})(jQuery, mQuery);


(function($, $m) {

$.fn.bindTo = function(model, formatterFn) {

    var formattedValue = $.isFunction(formatterFn)
            ? function (value) {
                return formatterFn(model.val());
            }
            : function (value) {
                return model.val();
            };

    this.each(function() {
        var self = $(this),
            guard = {};
        if (self.is("input[type=text]")) {

            function applyInputValue() {
                self.val(formattedValue());
            }

            applyInputValue();

            model.change(function(e) {
                if (e != guard) {
                    applyInputValue()
                }
            });

            self
            .keyup(function() {
                model.val(self.val()).change(guard);
            });

        } else if(self.is("select")) {

            function applySelectValue() {
                self.val(model.val());
            }

            applySelectValue();

            model.change(function(e) {
                if (e != guard) {
                    applySelectValue()
                }
            });

            self
            .change(function() {
                model.val(self.val()).change(guard);
            });

        } else if(self.is("input:checkbox")) {

            function applyCheck() {
                self.attr("checked", model.val() === true);
            }

            applyCheck();

            model.change(function(e) {
                if (e != guard) {
                    applyCheck();
                }
            });

            self
            .change(function() {
                model.val(self.is(":checked")).change(guard);
            });

        } else {
            self.html(formattedValue());
            model.change(function() {
                self.html(formattedValue());
            });
        }
    });
};

})(jQuery, mQuery);