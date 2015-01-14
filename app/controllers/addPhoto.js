var args = arguments[0] || {},
    logger = require("logger");

Ti.Media.showCamera({
	success : function(e) {
		logger.i("success");
	},
	cancel : function() {
		logger.i("error");
	},
	error : function(error) {
		logger.i("error: " + JSON.stringify(error));
	},
	autohide : false,
	showControls : true
});
