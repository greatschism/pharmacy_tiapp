var args = arguments[0] || {},
    isOpened = false,
    isCloseRequested = false;

(function() {

	if (Alloy.Globals.spinnerImages) {
		$.activityIndicatorImg.images = Alloy.Globals.spinnerImages;
	}

	var options = _.pick(args, ["font", "color", "textAlign", "text"]);
	if (!_.isEmpty(options)) {
		$.messageLbl.applyProperties(options);
	}

	options = _.pick(args, ["images", "accessibilityHidden", "accessibilityLabel", "accessibilityValue", "accessibilityValueHint"]);
	if (!_.isEmpty(options)) {
		$.activityIndicatorImg.applyProperties(options);
	}

	if (_.has(args, "message")) {
		setMessage(args.message);
	}

	if (args.visible !== false) {
		show();
	}

})();

function didOpen(e) {
	isOpened = true;
	if (isCloseRequested) {
		hide();
	}
}

function setMessage(message) {
	$.messageLbl.text = message;
}

function show() {
	$.activityIndicatorImg.start();
	$.window.open({
		animated : false
	});
}

function hide() {
	isCloseRequested = true;
	if (isOpened) {
		$.activityIndicatorImg.stop();
		$.window.close({
			animated : false
		});
	}
}

exports.show = show;
exports.hide = hide;
exports.setMessage = setMessage;
