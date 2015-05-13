var args = arguments[0] || {},
    isOpened = false,
    isCloseRequested = false;

(function() {

	var options = _.pick(args, ["font", "color", "textAlign", "text"]);
	if (!_.isEmpty(options)) {
		$.messageLbl.applyProperties(options);
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

function setMessage(_message) {
	$.window.title = _message;
	$.messageLbl.text = _message;
}

function show() {
	$.activityIndicator.show();
	$.window.open({
		animated : false
	});
}

function hide() {
	isCloseRequested = true;
	if (isOpened) {
		$.window.close({
			animated : false
		});
	}
}

function didAndroidback() {
	return false;
}

exports.show = show;
exports.hide = hide;
exports.setMessage = setMessage;
