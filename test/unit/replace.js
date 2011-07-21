/**
 * Created by IntelliJ IDEA.
 * User: ogoldobin
 * Date: 15.07.11
 * Time: 16:42
 * To change this template use File | Settings | File Templates.
 */


(function() {

module("Replace");

//test("should replace simple types such as booleans, numbers and strings", function() {
//    var wrapper = $m({
//        stringVal: "testVal1",
//        numberVal: 1,
//        booleanVal: true,
//        obj: {
//            stringVal: "testVal2",
//            numberVal: 1,
//            booleanVal: false
//        },
//        arr: ["test3", 2, true]
//    });
//
//    var replacements = [{
//        path: "stringVal",
//        value: "replacedTestVal1"
//    }, {
//        path: "numberVal",
//        value: 10
//    }, {
//        path: "booleanVal",
//        value: false
//    }, {
//        path: "obj.stringVal",
//        value: "replacedTestVal1"
//    }, {
//        path: "obj.numberVal",
//        value: 20
//    }, {
//        path: "obj.booleanVal",
//        value: true
//    }, {
//        path: "arr.0",
//        value: "replacedTestVal1"
//    }, {
//        path: "arr.1",
//        value: 20
//    }, {
//        path: "arr.2",
//        value: true
//    }];
//
//    wrapper.replace(replacements);
//
//    $.each(replacements, function(i, e) {
//        strictEqual(wrapper.find(e.path).val(), e.value);
//    })
//
//});

//test("should replace objects and arrays with complete copy of source", function() {
//    var wrapper = $m({
//        obj: {
//            stringVal: "testVal",
//            numberVal: 1,
//            booleanVal: false
//        },
//        arr: ["test3", 2, true]
//    });
//
//    var replacements = [{
//        path: "obj",
//        value: {
//            stringVal2: "testVal2",
//            numberVal2: 1902
//        }
//    }, {
//        path: "arr",
//        value: [10, 20, 30, 40]
//    }];
//
//    wrapper.replace(replacements);
//
//    ok(typeof wrapper.find("obj.stringVal").val() === undefined);
//    ok(typeof wrapper.find("obj.numberVal").val() === undefined);
//    ok(typeof wrapper.find("obj.booleanVal").val() === undefined);
//    deepEqual(wrapper.find("obj").val(), replacements[0].value);
//
//    replacements[0].value.stringVal2 = "testVal3";
//    replacements[0].value.numberVal2 = 2004;
//    notDeepEqual(wrapper.find("obj").val(), replacements[0].value);
//
//
//    equal(wrapper.find("arr").val(), replacements[1].value);
//    replacements[1].value.push(100);
//    notEqual(wrapper.find("arr").val(), replacements[1].value);
//});

test(
    "method 'replace' should replace simple types, objects and arrays by path " +
    "with rising change event on the specific path",
    function() {

    });
})();
