/**
 * Created by IntelliJ IDEA.
 * User: ogoldobin
 * Date: 15.07.11
 * Time: 16:56
 * To change this template use File | Settings | File Templates.
 */

(function() {

module("Events");

// TODO: Split this test
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

        var
        wrapper = $m({
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


})();
