/**
 * Created by IntelliJ IDEA.
 * User: ogoldobin
 * Date: 15.07.11
 * Time: 16:42
 * To change this template use File | Settings | File Templates.
 */


(function() {

module("Replace");
test("should replace simple types such as booleans, numbers and strings", function() {
    var wrapper = $m({
        stringVal: "testVal1",
        numberVal: 1,
        booleanVal: true,
        obj: {
            stringVal: "testVal2",
            numberVal: 1,
            booleanVal: false
        },
        arr: ["test3", 2, true]
    });

    var replacements = [{
        path: "stringVal",
        value: "replacedTestVal1"
    }, {
        path: "numberVal",
        value: 10
    }, {
        path: "booleanVal",
        value: false
    }, {
        path: "obj.stringVal",
        value: "replacedTestVal1"
    }, {
        path: "obj.numberVal",
        value: 20
    }, {
        path: "obj.booleanVal",
        value: true
    }, {
        path: "arr.0",
        value: "replacedTestVal1"
    }, {
        path: "arr.1",
        value: 20
    }, {
        path: "arr.2",
        value: true
    }];

    wrapper.replace(replacements);

    $.each(replacements, function(i, e) {
        strictEqual(wrapper.find(e.path).val(), e.value);
    })

});
test("should replace objects with complete copy of source", function() {});
test("should replace arrays with complete copy of source", function() {});
test("should prevent to replace values with value of different type", function() {});
//test("replace", function() {
//    var wrapper = $m({
//        stringVal: "testVal1",
//        numberVal: 1,
//        objectVal: {
//            stringVal2: "test1",
//            objectVal2: {
//                someVal2: "test2"
//            }
//        },
//        arrayVal: ["test3", 2, {
//            stringVal3: "test4",
//            objectVal3: {
//                someVal3: "test5"
//            }
//        }]
//    });
//
//
//    var replacements = [{
//        path: "numberVal",
//        value: "Number Replacement"
//    }, {
//        path: "objectVal",
//        value: {
//            replacedStringVal2: "Test1",
//            replacedObjectVal2: {
//                replacedSomeVal2: "Test5"
//            }
//        }
//    }],
//    changeCount = 0;
//
//    function incrementChanges() {
//        changeCount ++;
//    }
//
//    wrapper
//    .find("objectVal")
//    .change(incrementChanges);
//
//    wrapper
//    .find("numberVal")
//    .change(incrementChanges);
//
//    wrapper.replace(replacements);
//
//    ok(typeof wrapper.val().numberVal === "string");
//    strictEqual(wrapper.val().numberVal, "Number Replacement");
//
//    ok(typeof wrapper.val().objectVal === "object");
//
//    ok(wrapper.val().stringVal2 === undefined);
//    ok(wrapper.val().objectVal2 === undefined);
//
//    ok(!wrapper.val().objectVal == replacements[1]);
//    deepEqual(wrapper.val().replacedStringVal2, replacements[1]);
//
//    equal(changeCount, 2);
//});


})();
