var args = arguments[0] || {};







Ti.Media.showCamera({
		success : function(e) {
			Ti.API.info("success");
		},
		cancel : function() {
			Ti.API.info("error");
		},
		error : function(error) {
			Ti.API.info("error: " + JSON.stringify(error));
		},
		autohide : false,
		showControls : true
	});
