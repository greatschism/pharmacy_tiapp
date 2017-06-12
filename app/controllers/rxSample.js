var args = $.args,
    app = require("core"),
        utilities = require("utilities");

var parts = Alloy.Models.appload.get("sampl_rx_image").split('_'),
						whole = parts[0],
						fractional = parts[1] || '';
						
$.img.accessibilityLabel = Alloy.Globals.strings.rxSampleImgAccessibilityLabel;
$.img.image = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, fractional).read();
setImageinAspectRatio();

function setImageinAspectRatio() {
	var desiredWidth = utilities.percentageToValue("99%", app.device.width);
    var widthOfImage = $.img.image.width;  
    var heightOfImage = $.img.image.height;

	var aspectRatio =  heightOfImage / widthOfImage;
    var desiredHeight = desiredWidth*aspectRatio;
    $.img.width = desiredWidth;
    $.img.height = desiredHeight;
}
