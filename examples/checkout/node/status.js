

var $ = require("dsign.js"),
    descriptors = {
        ok: {
            statusCode: 200,
            displayName: "Found"
        },
        found: {
            statusCode: 302,
            displayName: "Found"
        },
        badRequest: {
            statusCode: 400,
            displayName: "Bad Request"
        },
        notFound: {
            statusCode: 404,
            displayName: "Not Found"
        },
        internalServerError: {
            statusCode: 500,
            displayName: "Internal Server Error"
        },
        serviceUnavailable: {
            statusCode: 503,
            displayName: "Service Unavailable"
        }
    };

$.each(descriptors, function(name, value) {

    var responder = function(res, headers, contentFn) {
        res.writeHead(value.statusCode, headers);
        if ($.isFunction(contentFn)) {
            contentFn();
        }
        res.end();
    };

    exports[name] = responder;
    exports[value.statusCode] = responder;
});


