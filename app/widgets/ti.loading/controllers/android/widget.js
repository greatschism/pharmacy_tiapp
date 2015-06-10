var args = arguments[0] || {},
    isOpened = false,
    isCloseRequested = false;

(function() {

	var options = _.pick(args, ["font", "color", "message"]);
	if (!_.isEmpty(options)) {
		$.progressIndicator.applyProperties(options);
	}

	if (args.visible !== false) {
		show();
	}

})();

function setMessage(message) {
	$.progressIndicator.message = message;
}

function show() {
	$.progressIndicator.show();
}

function hide() {
	$.progressIndicator.hide();
}

exports.show = show;
exports.hide = hide;
exports.setMessage = setMessage;
