var http = require('http'),
    settings = require("./settings.js");
    fs = require("fs");

http
.createServer(function (req, res) {

    if (/^\/$/.test(req.url)) {
        fs.readFile("../html/home.html", function(err, data) {
            res.writeHead(200, {
                "Content-Type": "text/html"
            });
            res.write(data, "UTF-8");
            res.end();
        });
    } else {
        res.writeHead(404);
        res.end();
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
