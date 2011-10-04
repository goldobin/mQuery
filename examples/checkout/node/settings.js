

(function() {
    var fs = require("fs"),
        defaultSettings = {
            "bindHost": "127.0.0.1",
            "bindPort": 8080,
            "verbose": false
        },
        customSettingsData = fs.readFileSync("settings.json", "UTF-8"),
        customSettings = JSON.parse(customSettingsData),
        resultSettings = {},
        name;

    for (name in defaultSettings) {
        var defaultValue = defaultSettings[name],
            customValue = customSettings[name];

        resultSettings[name] =
            (customValue !== undefined &&
            typeof customValue === typeof defaultValue)
            ? customValue
            : defaultValue;
    }

    for (name in resultSettings) {
        (function() {
            var propertyName = name;
            Object.defineProperty(
                exports,
                name, {
                get: function() {
                    return resultSettings[propertyName];
                }
            });
        })();
    }

    if (resultSettings.verbose) {
        console.log("Settings are:");
        for (name in resultSettings) {
            console.log("\t" + name + " = " + resultSettings[name])
        }
    }
})();




