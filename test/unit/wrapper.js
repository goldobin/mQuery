/**
 * Created by IntelliJ IDEA.
 * User: ogoldobin
 * Date: 15.07.11
 * Time: 16:42
 * To change this template use File | Settings | File Templates.
 */

(function() {

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

})();