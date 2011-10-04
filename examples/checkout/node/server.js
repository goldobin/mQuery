var http = require('http');
var settings = require("./settings.js");

http
.createServer(function (req, res) {
    res.writeHead(200, {
        "Content-Type": "text/plain"
    });

    res.end('Hello World\n');
})
.listen(
    settings.bindPort,
    settings.bindHost
);

if (settings.verbose) {
    var url = "http://" + settings.bindHost + (settings.bindPort != 80 ? (':' + settings.bindPort) : '') + '/';
    console.log('Server running at ' + url);
}
