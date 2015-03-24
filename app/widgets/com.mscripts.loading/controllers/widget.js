var args = arguments[0] || {};
(function() {

	var options = _.pick(args, ["cancelable", "location", "type"]);
	if (!_.isEmpty(options)) {
		$.indicator.applyProperties(options);
	}

	if (args.message) {
		setMessage(args.message);
	}

	if (args.visible !== false) {
		show();
	}

})();

function setMessage(_message) {
	if (OS_ANDROID) {
		$.indicator.setMessage(_message);
	} else {
		$.indicatorView.accessibilityLabel = _message;
	}
}

function show() {
	$.indicator.show();
	if (OS_IOS) {
		$.window.open();
	}
}

function hide() {
	$.indicator.hide();
	if (OS_IOS) {
		$.window.close();
	}
}

exports.show = show;
exports.hide = hide;
exports.setMessage = setMessage;
