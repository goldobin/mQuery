/**
 * Created by .
 * User: ogoldobin
 * Date: 01/06/11
 * Time: 13:14
 * To change this template use File | Settings | File Templates.
 */

$(function() {

var NUMBER_SUFFIXES = ["st", "nd", "d"];

function caseNumberMessage(i) {
    var suffix = NUMBER_SUFFIXES[i];

    ok(true, "Running " + (i + 1) + "-" + (suffix !== undefined ? suffix : "th") + " case");

}

module("Utilities");

test("escape path element", function() {

    var elements = [
        "",
        "somepath",
        "some path",
        "some.path",
        "some\\path",
        ".some\\path",
        "\\some.path",
        "some\\path.",
        "some.path\\"
    ];

    $.each(elements, function() {
        var expecting = this
                .replace(/\\/g, "\\\\")
                .replace(/\./g, "\\.")
                .replace(/\ /g, "\\ "),
            escaped = $m.escape(this);

        equal(escaped, expecting);
    });
});

test("make path", function() {

    var paths = [{
        elements: [],
        expecting: ""
    }, {
        elements: ["some"],
        expecting: "some"
    }, {
        elements: ["some", "path"],
        expecting: "some.path"
    }, {
        elements: ["some", "path", "third"],
        expecting: "some.path.third"
    }, {
        elements: ["some.", "path"],
        expecting: "some\\..path"
    }, {
        elements: ["some", "\\path"],
        expecting: "some.\\\\path"
    }, {
        elements: ["so me", "pa.th", "th\\ird"],
        expecting: "so\\ me.pa\\.th.th\\\\ird"
    }];

    $.each(paths, function() {
        var path = $m.path(this.elements);
        equal(path, this.expecting);
    });
});

test("split path", function() {
    var paths = [{
        path: "",
        expecting: []
    }, {
        path: "some",
        expecting: ["some"]
    }, {
        path: "some.path",
        expecting: ["some", "path"]
    }, {
        path: "some.path.third",
        expecting: ["some", "path", "third"]
    }, {
        path: "some\\.pa.th",
        expecting: ["some.pa", "th"]
    }, {
        path: "some\\\\pa.th",
        expecting: ["some\\pa", "th"]
    }, {
        path: "some\\ pa.th",
        expecting: ["some pa", "th"]
    }, {
        path: ".some.th",
        expecting: []
    }, {
        path: "some.path.",
        expecting: ["some", "path"]
    }, {
        path: "\\\\some.path",
        expecting: ["\\some", "path"]
    }, {
        path: "\\.some.path",
        expecting: [".some", "path"]
    }, {
        path: "\\ some.path",
        expecting: [" some", "path"]
    }, {
        path: "some.path\\\\",
        expecting: ["some", "path\\"]
    }, {
        path: "some.path\\.",
        expecting: ["some", "path."]
    }, {
        path: "some.path\\ ",
        expecting: ["some", "path "]
    }, {
        path: "some.\\ path",
        expecting: ["some", " path"]
    }];

    $.each(paths, function() {
        var split = $m.split(this.path);
        deepEqual(split, this.expecting);
    });
});


module("Wrapper");

test("initialization", function() {
    var someObj = {
            someVal1: "someVal1"
        },
        wrapped = $m(someObj);

    ok(wrapped.isRoot(), "must be root");
    equal(wrapped.val(), someObj);
    ok(wrapped === wrapped.root());
    ok(null === wrapped.parent());
});

test("valid search", function() {
    var o = {
            stringVal: "testVal1",
            numberVal: 1,
            objectVal: {
                stringVal2: "test1",
                objectVal2: {
                    someVal2: "test2"
                }
            },
            arrayVal: ["test3", 2, {
                stringVal3: "test4",
                objectVal3: {
                    someVal3: "test5"
                }
            }]
        },
        wrapper = $m(o),
        validSearchCases = [{
                path: ["stringVal"],
                type: "string"
            }, {
                path: ["numberVal"],
                type: "number"
            }, {
                path: ["objectVal"],
                type: "object"
            }, {
                path: ["arrayVal"],
                type: "object",
                isArray: true
            }, {
                path: ["objectVal", "stringVal2"],
                type: "string"
            }, {
                path: ["objectVal", "objectVal2", "someVal2"],
                type: "string"
            }, {
                path: ["arrayVal", 0],
                type: "string"
            }, {
                path: ["arrayVal", 1],
                type: "number"
            }, {
                path: ["arrayVal", 2, "stringVal3"],
                type: "string"
            }
        ];

    $.each(validSearchCases, function(i, validSearch) {
        caseNumberMessage(i);

        var expectingPath = validSearch.path.join("."),
            expectingVal = o;

        $.each(validSearch.path, function(i, fieldName) {
            expectingVal = expectingVal[fieldName];
        });

        var foundWrapper = wrapper.find(expectingPath);

        ok(!foundWrapper.isVirtual(), "Wrapper is not virtual");
        equal(foundWrapper.val(), expectingVal, "Value not changed");
        equal(typeof foundWrapper.val(), validSearch.type, "Value type not changed");

        if (validSearch.isArray === true) {
            ok($.isArray(foundWrapper.val()));
        }

        equals(foundWrapper.path(), expectingPath, "Path valid");
        ok(wrapper === foundWrapper.root(), "Root is root wrapper");

    });
});

test("invalid search", function() {

    var wrapper = $m({
            stringVal: "testVal1",
            numberVal: 1,
            objectVal: {
                stringVal2: "test1",
                objectVal2: {
                    someVal2: "test2"
                }
            },
            arrayVal: ["test3", 2, {
                stringVal3: "test4",
                objectVal3: {
                    someVal3: "test5"
                }
            }]
        }),
        virtualWrapperSearchCases = [
        /* "", */  // TODO: Handle empty path case
        "stringVal.length",
        "numberVal.someFakeField",
        "objectVal.someFakeField",
        "arrayVal.-1",
        "arrayVal.3",
        "arrayVal.someNotNumberValue"
    ];


    $.each(virtualWrapperSearchCases, function(i, path) {
        caseNumberMessage(i);

        var foundWrapper = wrapper.find(this);

        ok(foundWrapper.isVirtual(), "Wrapper is virtual");
        ok(wrapper == foundWrapper.root(), "Root is root wrapper");
        ok(undefined === foundWrapper.val(), "Value is undefined");
        strictEqual(foundWrapper.path(), path, "Path valid");


    });
});

module("Merge and Replace");

test("override existing values", function() {
    var wrapper = $m({
        stringVal: "testVal1",
        numberVal: 1,
        objectVal: {
            stringVal2: "test1",
            objectVal2: {
                someVal2: "test2"
            }
        },
        arrayVal: ["test3", 2, {
            stringVal3: "test4",
            objectVal3: {
                someVal3: "test5"
            }
        }]
    });

    var expectedChangeEvents = [{
        path: "stringVal",
        value: "otherTestVal1"
    }, {
        path: "arrayVal.0",
        value: 321
    }, {
        path: "objectVal.stringVal2",
        value: "otherTestVal2"
    }];


    $.each(expectedChangeEvents, function(i, spec) {
        spec.triggerCount = 0;
        wrapper.bind(spec.path, "change", function(e) {
            spec.triggerCount ++;
            equal (this.val(), spec.value, "Value was already updated");
        })
    });

    var globalChangeHandlerTriggerCount = 0;

    wrapper.bind("change", function() {
        globalChangeHandlerTriggerCount++
    });

    wrapper.merge({
        stringVal: "otherTestVal1",
        arrayVal: [321],
        objectVal: {
            stringVal2: "otherTestVal2"
        }
    });

    equal(globalChangeHandlerTriggerCount, expectedChangeEvents.length, "Global change event handler executed exactly same times as changes made");

    $.each(expectedChangeEvents, function(i, spec) {
        equal(spec.triggerCount, 1, "Event handler was executed one time");
    });


    equal(wrapper.val().stringVal, "otherTestVal1");
    equal(wrapper.val().arrayVal[0], 321);
    equal(wrapper.val().objectVal.stringVal2, "otherTestVal2");
});

test("extending arrays and objects", function() {
    var wrapper = $m({
        stringVal: "testVal1",
        numberVal: 1,
        objectVal: {
            stringVal2: "test1",
            objectVal2: {
                someVal2: "test2"
            }
        },
        arrayVal: ["test3", 2, {
            stringVal3: "test4",
            objectVal3: {
                someVal3: "test5"
            }
        }]
    }), innerObject = {
        field: "someValue"
    };

    var expectedChangeEvents = [{
        path: "arrayVal",
        expectedTriggerCount: 4
    }, {
        path: "objectVal",
        expectedTriggerCount: 1
    }, {
        path: "",
        expectedTriggerCount: 6
    }];

    $.each(expectedChangeEvents, function(i, spec) {
        spec.triggerCount = 0;
        wrapper.bind(spec.path, "change", function(e) {
            spec.triggerCount ++;
        })
    });


    wrapper.merge({
        stringVal2: "stringVal2Value",
        arrayVal: [1, 2, 3, innerObject, 5],
        objectVal: {
            stringVal3: "stringVal3Value"
        }
    });

    $.each(expectedChangeEvents, function(i, spec) {
        equal(
            spec.triggerCount,
            spec.expectedTriggerCount,
                "Event handler was executed "
                + spec.expectedTriggerCount
                + " time(s)");
    });

    equal(wrapper.val().stringVal2, "stringVal2Value");
    equal(wrapper.val().arrayVal.length, 5);
    deepEqual(wrapper.val().arrayVal[3], innerObject);
    equal(wrapper.val().arrayVal[4], 5);
    equal(wrapper.val().objectVal.stringVal3, "stringVal3Value");
});

module("Events");

test("binding/triggering", function() {

    var cases = [{
        bindPath: "stringVal",
        bindEvent: "someEvent",
        triggerPath: "stringVal",
        triggerEvent: "someEvent",
        shouldBeHandled: true
    }, {
        bindPath: "objectVal",
        bindEvent: "someEvent",
        triggerPath: "objectVal.stringVal2",
        triggerEvent: "someEvent",
        shouldBeHandled: true
    }, {
        bindPath: "objectVal",
        bindEvent: "someEvent",
        triggerPath: "",
        triggerEvent: "someEvent",
        shouldBeHandled: false
    }, {
        bindPath: "stringVal",
        bindEvent: "someEvent",
        triggerPath: "stringVal",
        triggerEvent: "some",
        shouldBeHandled: false
    }, {
        bindPath: "stringVal",
        bindEvent: "someEvent",
        triggerPath: "incorrectTriggerPath",
        triggerEvent: "someEvent",
        shouldBeHandled: false
    },  {
        bindPath: "someVirtualField",
        bindEvent: "someEvent",
        triggerPath: "someVirtualField",
        triggerEvent: "someEvent",
        shouldBeHandled: false
    },  {
        bindPath: "stringVal.someVirtualField",
        bindEvent: "someEvent",
        triggerPath: "stringVal.someVirtualField",
        triggerEvent: "someEvent",
        shouldBeHandled: false
    }];

    $.each(cases, function(i, c) {
        caseNumberMessage(i);

        var wrapper = $m({
                stringVal: "testVal1",
                numberVal: 1,
                objectVal: {
                    stringVal2: "test1",
                    objectVal2: {
                        someVal2: "test2"
                    }
                },
                arrayVal: ["test3", 2, {
                    stringVal3: "test4",
                    objectVal3: {
                        someVal3: "test5"
                    }
                }]
            }),
            eventHandledTimes = 0,
            eventParams = {test: "Param Value", secondField: "Param Value 2"};

        wrapper.bind(c.bindPath, c.bindEvent, function(e) {
            eventHandledTimes++;
            equal(this.path(), c.bindPath, "Path valid");
            ok(wrapper == this.root(), "Root is root wrapper");
            equal(e, eventParams, "Event params not changed")
        });

        wrapper.trigger(c.triggerPath, c.triggerEvent, eventParams);
        equals(eventHandledTimes, c.shouldBeHandled ? 1 : 0, "Handler executed valid times");
    });
});




});