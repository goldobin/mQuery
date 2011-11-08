
var fs = require("fs"),
    http = require('http'),
    status = require("status.js"),
    settings = require("./settings.js");

http
.createServer(function (req, res) {

    if (/^\/$/.test(req.url)) {
        fs.readFile("../html/home.html", function(err, data) {
            status.success.ok(res, { "Content-Type": "text/html" }, function() {
                res.write(data, "UTF-8");
            });
        });
    } else {
        status.notFound(res);
    }
})
.listen(
    settings.bindPort,
    settings.bindHost
);

if (settings.verbose) {
    var url = "http://" + settings.bindHost + (settings.bindPort != 80 ? (':' + settings.bindPort) : '') + '/';
    console.log('Server running at ' + url);
}
