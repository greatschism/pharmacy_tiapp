var args = arguments[0] || {},
    logger = require("logger");

Ti.Media.showCamera({
	success : function(e) {
		logger.info("success");
	},
	cancel : function() {
		logger.info("error");
	},
	error : function(error) {
		logger.info("error: " + JSON.stringify(error));
	},
	autohide : false,
	showControls : true
});
