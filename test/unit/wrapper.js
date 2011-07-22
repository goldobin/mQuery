/**
 * Created by IntelliJ IDEA.
 * User: ogoldobin
 * Date: 15.07.11
 * Time: 16:42
 * To change this template use File | Settings | File Templates.
 */

(function() {

module("Wrapper");

test(
    "method 'wrap' ('$m') should rise an exception " +
    "if specified object is a basic type because " +
    "root element of hierarchy should be an object",
    function() {
        raises(function() {
            $m(true);
        });

        raises(function() {
            $m(10);
        });

        raises(function() {
            $m("test");
        });
    }
);

test(
    "method 'wrap' ('$m') should rise an exception " +
    "if specified object is not a plain objects",
    function() {

        function SomeConstructor() {
            this.value = 345;
        }

        raises(function() {
            $m(new SomeConstructor());
        });
    }
);

test(
    "method 'wrap' ('$m') should return root wrapper with empty object wrapped " +
    "when no object specified",
    function() {
        var o = $m().val();
        ok(typeof o === "object");
        ok($.isEmptyObject(o));
    }
);



test("method 'wrap' ('$m') should return root wrapper with no parents", function() {
    var o = {
            someVal1: "someVal1"
        },
        wrapper = $m(o);

    ok(wrapper.isRoot(), "must be root");
    deepEqual(wrapper.val(), o);
    strictEqual(wrapper.root(), wrapper);
    strictEqual(wrapper.parent(), undefined);
});

test("root wrapper should store deep copy of source object or array", function() {
    var o = {
        stringVal: "testVal1",
        numberVal: 1,
        booleanVal: false,
        objectVal: {
            stringVal2: "test1",
            numberVal2: 2,
            booleanVal2: false
        },
        arrayVal: ["testVal3", 3, false]
    };

    var wrapper = $m(o);

    deepEqual(wrapper.val(), o);
    o.stringVal = "testVal2";
    o.anotherStringVal = "testVal3";
    notDeepEqual(wrapper.val(), o);
});


test("method 'val' should accept values of the same type as wrapped object", function() {
    var o = {
        stringVal: "testVal1",
        numberVal: 1,
        booleanVal: false,
        objectVal: {
            stringVal2: "test1",
            numberVal2: 2,
            booleanVal2: false
        },
        arrayVal: ["testVal3", 3, false]
    },
    validAssignmentCases = [{
            field: "stringVal",
            valueToAssign: "newTestVal"
        }, {
            field: "numberVal",
            valueToAssign: 20
        }, {
            field: "booleanVal",
            valueToAssign: true
        }, {
            field: "objectVal",
            valueToAssign: {
                someVal1: "test",
                someVal2: 190,
                someVal3: false
            }
        }, {
            field: "arrayVal",
            valueToAssign: [10, 40, 50]
        }
    ],
    invalidAssignmentCases = [{
            field: "stringVal",
            valueToAssign: 10
        }, {
            field: "numberVal",
            valueToAssign: true
        }, {
            field: "booleanVal",
            valueToAssign: {
                someVal1: false
            }
        }, {
            field: "objectVal",
            valueToAssign: "test"
        }, {
            field: "objectVal",
            valueToAssign: [10, 300, 50]
        }, {
            field: "arrayVal",
            valueToAssign: {
                someVal1: "test1"
            }
        }, {
            field: "arrayVal",
            valueToAssign: false
        }
    ];

    $.each(validAssignmentCases, function(i, e) {
        var wrapper = $m(o);

        wrapper.find(e.field).val(e.valueToAssign);
        deepEqual(wrapper.find(e.field).val(), e.valueToAssign);
    });

    $.each(invalidAssignmentCases, function(i, e) {
        var wrapper = $m(o);

        raises(function() {
            wrapper.find(e.field).val(e.valueToAssign);
        });
    });
});

test(
    "method 'val' while assigning a plain object or array should replace " +
    "original instance with complete copy of source",
    function() {
        var wrapper = $m({
            objectVal: {
                stringVal: "test1",
                numberVal: 2,
                booleanVal: false
            },
            arrayVal: ["testVal3", 3, false]
        }),
        obj = {
            someVal1: "test",
            someVal2: 3
        },
        cloneOfObj = $.extend(true, {}, obj),
        arr = [10, 40, 50],
        cloneOfArr = $.extend(true, [], arr);

        wrapper.find("objectVal").val(obj);
        deepEqual(wrapper.find("objectVal").val(), obj);
        obj.someVal1 = 678;
        deepEqual(wrapper.find("objectVal").val(), cloneOfObj);

        wrapper.find("arrayVal").val(arr);
        deepEqual(wrapper.find("arrayVal").val(), arr);
        arr.push(891);
        deepEqual(wrapper.find("arrayVal").val(), cloneOfArr);
    }
);

test("method 'val' should return complete copy of wrapped object or array", function() {
    var obj = {
        objectVal: {
            stringVal: "test1",
            numberVal: 2,
            booleanVal: false
        },
        arrayVal: ["testVal3", 3, false]
    },
    cloneOfObj = $.extend(true, {}, obj),
    wrapper = $m(obj);

    var objectVal = wrapper.find("objectVal").val(),
    arrayVal = wrapper.find("arrayVal").val();

    objectVal.stringVal2 = "test2";
    arrayVal.push("test2");

    deepEqual(wrapper.val(), cloneOfObj);
});

test("method 'val' should prevent assignment on virtual wrapper", toDo);

// TODO: Split this test
test("search by valid path should return valid not virtual wrapper", function() {
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
        deepEqual(foundWrapper.val(), expectingVal, "Value not changed");
        equal(typeof foundWrapper.val(), validSearch.type, "Value type not changed");

        if (validSearch.isArray === true) {
            ok($.isArray(foundWrapper.val()));
        }

        equals(foundWrapper.path(), expectingPath, "Path valid");
        ok(wrapper === foundWrapper.root(), "Root is root wrapper");

    });
});

// TODO: Split this test
test("search by not existent path should return virtual wrapper", function() {

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
        caseNumberMessage(i);

        var foundWrapper = wrapper.find(this);

        ok(foundWrapper.isVirtual(), "Wrapper is virtual");
        ok(wrapper == foundWrapper.root(), "Root is root wrapper");
        ok(foundWrapper.val() === undefined, "Value is undefined");
        strictEqual(foundWrapper.path(), path, "Path valid");


    });
});


})();