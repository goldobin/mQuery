/**
 * Created by IntelliJ IDEA.
 * User: ogoldobin
 * Date: 15.07.11
 * Time: 16:42
 * To change this template use File | Settings | File Templates.
 */

(function() {
module("Merge");

// TODO: Split this test
test("should override existing values", function() {
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

// TODO: Split this test
test("should extend arrays and objects", function() {
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

test("method 'merge' should support only plain objects", toDo);

})();
