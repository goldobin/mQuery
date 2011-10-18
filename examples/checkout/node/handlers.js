
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

var util = require("./util.js"),
    url = require("url"),
    fs = require("fs"),
    responders = require("./http-responders.js"),
    defaults = {
        root: "html",
        types: TYPES,
        localPathFn: function(pathname) {
            return pathname;
        }
    };

exports.createFileHandler = function(opts) {

    var settings = util.extend({}, defaults, opts);

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

