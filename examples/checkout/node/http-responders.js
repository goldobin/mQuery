

var util = require("./util.js"),
    descriptors = {
    success: {
        ok: {
            statusCode: 200,
            displayName: "Found"
        }
    },
    redirection: {
        found: {
            statusCode: 302,
            displayName: "Found"
        }
    },
    clientError: {
        badRequest: {
            statusCode: 400,
            displayName: "Bad Request"
        },
        notFound: {
            statusCode: 404,
            displayName: "Not Found"
        }
    },
    serverServer: {
        internalServerError: {
            statusCode: 500,
            displayName: "Internal Server Error"
        },
        serviceUnavailable: {
            statusCode: 503,
            displayName: "Service Unavailable"
        }

    }
};

util.each(descriptors, function(group, value) {
    exports[group] = (function() {
        var groupResult = {};
        util.each(value, function(statusName, value) {
            groupResult[statusName] = function(res, headers, contentFn) {
                res.writeHead(value.statusCode, headers);
                if (util.isFunction(contentFn)) {
                    contentFn();
                }
                res.end();
            }
        });
        return groupResult;
    })();
});


