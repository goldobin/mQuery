
var TYPES = [{
    extension: "xml",
    mime: "text/xml"
}, {
    extension: [ "html", "htm" ],
    mime: "text/html"
}, {
    extension: [ "css", "less" ],
    mime: "text/css"
}, {
    extension: "json",
    mime: "application/json"
}, {
    extension: "gif",
    mime: "image/gif"
}, {
    extension: ["jpeg", "jpg", "jpe"],
    mime: "image/jpeg"
}];

(function() {

var $ = require("dsign.js"),
    url = require("url"),
    fs = require("fs"),
    responders = require("status.js"),
    defaults = {
        root: "html",
        types: TYPES,
        localPathFn: function(pathname) {
            return pathname;
        }
    };

exports.createFileHandler = function(opts) {

    var settings = $.extend({}, defaults, opts);

    return function(req, res) {

        var pathname = url.parse(req.url).pathname,
            localPath = settings.localPathFn(pathname);

        fs.readFile(settings.root + localPath, function(err, data) {

            if (err) {
                responders.clientError.notFound(res);
                return;
            }

            responders.success.ok(res, { "Content-Type": "text/html" }, function() {
                res.write(data, "UTF-8");
            });
        });
    }
};

})();

