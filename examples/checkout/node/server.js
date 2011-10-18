
var fs = require("fs"),
    http = require('http'),
    responders = require("./http-responders.js"),
    settings = require("./settings.js");

http
.createServer(function (req, res) {

    if (/^\/$/.test(req.url)) {
        fs.readFile("../html/home.html", function(err, data) {
            responders.success.ok(res, { "Content-Type": "text/html" }, function() {
                res.write(data, "UTF-8");
            });
        });
    } else {
        responders.clientError.notFound(res);
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
