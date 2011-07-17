/**
 * Created by IntelliJ IDEA.
 * User: ogoldobin
 * Date: 15.07.11
 * Time: 16:41
 * To change this template use File | Settings | File Templates.
 */


(function() {

module("Utilities");

test("'escape' utility should escape path separators, spaces and escape characters", function() {

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
test("'path' utility should make path string from array of elements", function() {

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
test("'split' utility should split path to array of parts", function() {
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

})();