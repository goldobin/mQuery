
var settings = {
        "bindHost": "127.0.0.1",
        "bindPort": 8080,
        "verbose": false
    },
    $ = require("dsign.js"),
    fs = require("fs"),
    customSettings = JSON.parse(fs.readFileSync("settings.json", "UTF-8"));

$.extend(settings, customSettings);
$.each(settings, function(name, value) {
    Object.defineProperty(
        exports,
        name, {
        get: function() {
            return value;
        }
    });
});

if (settings.verbose) {
    console.log("Settings are:");
    $.each(settings, function(name, value) {
        console.log("\t" + name + " = " + value)
    });
}





