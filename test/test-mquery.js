/**
 * Created by .
 * User: ogoldobin
 * Date: 01/06/11
 * Time: 13:14
 * To change this template use File | Settings | File Templates.
 */

$(function() {

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


test("find by path", function() {
    var someObj = {
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

    var wrapper = $m(someObj);
    var validSearchCases = [{
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

        var expectingPath = validSearch.path.join(".");
        var expectingVal = someObj;

        $.each(validSearch.path, function(i, fieldName) {
            expectingVal = expectingVal[fieldName];
        });

        var foundWrapper = wrapper.find(expectingPath);

        equals(expectingVal, foundWrapper.val());
        equals(validSearch.type, typeof foundWrapper.val());

        if (validSearch.isArray === true) {
            ok($.isArray(foundWrapper.val()));
        }

        equals(expectingPath, foundWrapper.path());
        ok(wrapper === foundWrapper.root());

    });

    var virtualWrapperSearchCases = [
        /* "", */  // TODO: Handle empty path case
        "stringVal.length",
        "numberVal.someFakeField",
        "objectVal.someFakeField",
        "arrayVal.-1",
        "arrayVal.3",
        "arrayVal.someNotNumberValue"
    ];


    $.each(virtualWrapperSearchCases, function(i, path) {
        var foundWrapper = wrapper.find(this);

        ok(wrapper == foundWrapper.root());
        ok(null == foundWrapper.val());
        strictEqual(path, foundWrapper.path());
    });

//    equals(someObj.stringVal, o.find("stringVal").val());
//    equals(someObj.numberVal, o.find("numberVal").val());
//    equals(someObj.objectVal, o.find("objectVal").val());
//    equals(someObj.arrayVal, o.find("arrayVal").val());
//
//    equals(someObj.objectVal.stringVal2, o.find("objectVal.stringVal2").val());
//    equals(someObj.objectVal.objectVal2.someVal1, o.find("objectVal.objectVal2.someVal").val());
//    equals(someObj.arrayVal[0], o.find("arrayVal.0").val());
//    equals(someObj.arrayVal[2].stringVal3, o.find("arrayVal.2.stringVal3").val());
//    equals(someObj.arrayVal[2].objectVal3.someVal3, o.find("arrayVal.2.objectVal3.someVal3").val());
})

});