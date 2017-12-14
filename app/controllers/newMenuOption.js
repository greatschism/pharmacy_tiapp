var args = $.args,
logger = require("logger");

function init() {
	logger.debug("args: "+args);
	$.webView.enableZoomControls = false;
	$.webView.applyProperties({
		top : 0,
		bottom : 0,
		url : $.strings.titleCouponsUrl,
		//url: Alloy.Models.appload.get("newMenu_url"),
		borderRadius: 1,
		willHandleTouches: false
	});	
}

exports.init = init;