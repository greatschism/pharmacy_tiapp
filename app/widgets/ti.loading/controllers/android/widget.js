var args = arguments[0] || {},
    isOpened = false,
    isCloseRequested = false;

(function() {
	applyProperties(args);
	if (args.visible !== false) {
		show();
	}
})();

function applyProperties(dict) {
	if (_.has(dict, "indicatorDict")) {
		$.progressIndicator.applyProperties(dict.indicatorDict);
	}
	if (_.has(dict, "message")) {
		setMessage(dict.message);
	}
}

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
exports.applyProperties = applyProperties;
