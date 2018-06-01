var args = $.args,
	logger = require("logger");

function init() {
	logger.debug("External URL to be opened: \n URL key: "+args.menu_url+"Url"+"\nActual URL: "+Alloy.Models.appload.get(args.menu_url+"Url"));
	$.webView.enableZoomControls = false;
	$.webView.applyProperties({
		top : 0,
		bottom : 0,
		url: Alloy.Models.appload.get(args.menu_url+"Url"),
		borderRadius: 1,
		willHandleTouches: false
	});	
}

exports.init = init;