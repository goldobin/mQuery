

/* usage */

/*
router
.get("/")
    .write({
        file: "filename.html",
        content: "Some Text Content",
        encoding: "UTF-8",
        type: "text/html"
    })
.end()
.get("/logic/state")
    .handle(function(req, resp) {
        var json = "{" +
            "\"foo\": 3, " +
            "\"boo\": false " +
        "}";
        resp.writeHead(200, {
            'Content-Length': json.length,
            'Content-Type': 'application/json'
        });
        resp.end();
    })
.end()
.post("/logic/itinerary")
    .process(function(req) {
        return {
            "name": "model",
            "type": "object"
        }
    })
    .present(function(model, out) {

    })
.end();
*/


var $ = require("dsign.js"),
http = require('http'),
fs = require("fs"),
url = require('url'),
status = require('./status.js'),
httpMethods = [
    "GET",
    "PUT",
    "POST",
    "DELETE"
],
serverDefaults = {
    bindPort: 80,
    bindHost: "127.0.0.1"
},
plugins = exports.plugins = {};

exports.createRouter = function() {
    var
    handlers = $.map(httpMethods, function() { return [] }),
    serverStarted = false,
    router = $.extend(
        {
            listen: function(opts) {
                var settings = $.extend({}, serverDefaults, opts);

                serverStarted = true;
                http
                .createServer(function (req, res) {
                    var pathname = url.parse(req.url),
                        methodHandlers = handlers[req.method],
                        handler;

                    $.each(methodHandlers, function(i, v) {
                        if (pathname.indexOf(v.path) != 0) {
                            return true;
                        }

                        handler = v.handler;
                        return false;
                    });

                    if (handler == null) {
                        status.notFound(res);
                        return;
                    }

                    handler(req, res);
                })
                .listen(
                    settings.bindPort,
                    settings.bindHost
                );
            }
        },
        $.transform(httpMethods, function(i, httpMethod) {
            return function(path) {
                return $.extend(
                    {},
                    plugins,
                    {
                        handle: function(fn) {
                            if (serverStarted) {
                                throw "Server already started so you can't add new handlers"
                            }
                            handlers[httpMethod].push({
                                path: path,
                                fn: fn
                            });
                            return this;
                        },
                        end: function() {
                            return router;
                        }
                    }
                )
            }
        })
    );

    return router;
};

plugins.write = function(opts) {

    var settings = $.extend({
            charset: "utf-8",
            type: "text/plain"
        },
        opts),
        contentType = settings.type + "; charset:" + settings.charset;

    return this.handle(function(req, res) {
        function respond (content) {
            var headers = {
                "Content-Type": contentType,
                "Content-Length": content.length
            };

            status.success.ok(res, headers, function() {
                res.write(content, settings.charset);
            });
        }

        if (settings.content !== undefined) {
            respond(settings.content);
        } else if (settings.file !== undefined) {
            fs.readFile(opts.file, function(err, data) {

                if (err) {
                    status.notFound();
                    return;
                }

                respond(data)
            });
        }
    })
};




