
var settings = {
        "bindHost": "127.0.0.1",
        "bindPort": 8080,
        "verbose": false
    },
    util = require("./util.js"),
    fs = require("fs"),
    customSettings = JSON.parse(fs.readFileSync("settings.json", "UTF-8"));

util.extend(settings, customSettings);
util.each(settings, function(name, value) {
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
    util.each(settings, function(name, value) {
        console.log("\t" + name + " = " + value)
    });
}





