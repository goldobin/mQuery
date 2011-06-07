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
    var someObj = {someVal1: "someVal1"};
    var wrapped = $m(someObj);

    ok(wrapped.isRoot(), "must be root");
    equal(someObj, wrapped.val());
    ok(wrapped === wrapped.root());
    ok(null === wrapped.parent());
});


function createTestObject() {
    return {
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
    };
}

test("valid search", function() {
    var someObj = createTestObject(),
        wrapper = $m(someObj),
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
            expectingVal = someObj;

        $.each(validSearch.path, function(i, fieldName) {
            expectingVal = expectingVal[fieldName];
        });

        var foundWrapper = wrapper.find(expectingPath);

        equals(expectingVal, foundWrapper.val(), "Value not changed");
        equals(validSearch.type, typeof foundWrapper.val(), "Value type not changed");

        if (validSearch.isArray === true) {
            ok($.isArray(foundWrapper.val()));
        }

        equals(expectingPath, foundWrapper.path(), "Path valid");
        ok(wrapper === foundWrapper.root(), "Root is root wrapper");

    });
});

test("invalid search", function() {

    var someObj = createTestObject(),
        wrapper = $m(someObj),
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

        ok(wrapper == foundWrapper.root(), "Root is root wrapper");
        ok(undefined === foundWrapper.val(), "Value is undefined");
        strictEqual(path, foundWrapper.path(), "Path valid");
    });
});

test("event binding/triggering", function() {

    var cases = [{
        bindPath: "testVal1",
        bindEvent: "someEvent",
        triggerPath: "testVal1",
        triggerEvent: "someEvent",
        shouldBeHandled: true
    }, {
        bindPath: "testVal1",
        bindEvent: "someEvent",
        triggerPath: "",
        triggerEvent: "someEvent",
        shouldBeHandled: true
    }, {
        bindPath: "testVal1",
        bindEvent: "someEvent",
        triggerPath: "testVal1",
        triggerEvent: "some",
        shouldBeHandled: false
    },  {
        bindPath: "someVirtualField",
        bindEvent: "someEvent",
        triggerPath: "",
        triggerEvent: "someEvent",
        shouldBeHandled: true
    },  {
        bindPath: "testVal.someVirtualField",
        bindEvent: "someEvent",
        triggerPath: "",
        triggerEvent: "someEvent",
        shouldBeHandled: true
    }];

    $.each(cases, function(i, c) {
        caseNumberMessage(i);

        var wrapper = $m(createTestObject()),
            eventHandledTimes = 0,
            eventParams = {test: "Param Value", secondField: "Param Value 2"};

        wrapper.bind(c.bindPath, c.bindEvent, function(e) {
            eventHandledTimes++;
            equals(c.bindPath, this.path(), "Path valid");
            ok(wrapper == this.root(), "Root is root wrapper");
            equals(eventParams, e, "Event params not changed")
        });

        wrapper.trigger(c.triggerPath, c.triggerEvent, eventParams);
        equals(c.shouldBeHandled ? 1 : 0, eventHandledTimes, "Handler executed valid times");
    });
});



});