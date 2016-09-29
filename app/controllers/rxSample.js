var args = $.args,
    app = require("core"),
        utilities = require("utilities");

var parts = Alloy.Models.appload.get("sampl_rx_image").split('_'),
						whole = parts[0],
						fractional = parts[1] || '';
						
$.img.image = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, fractional).read();
$.img.width = utilities.percentageToValue("80%", app.device.width);
$.img.height = utilities.percentageToValue("50%", app.device.height);