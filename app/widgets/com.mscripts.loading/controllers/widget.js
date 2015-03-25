var args = arguments[0] || {};
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

function setMessage(_message) {
	$.window.title = _message;
	$.messageLbl.text = _message;
}

function show() {
	$.activityIndicator.show();
	$.window.open();
}

function hide() {
	$.activityIndicator.hide();
	$.window.close();
}

function didAndroidback() {
	return false;
}

exports.show = show;
exports.hide = hide;
exports.setMessage = setMessage;
