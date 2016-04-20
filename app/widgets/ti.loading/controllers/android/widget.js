var args = $.args,
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

_.extend($, {
	show : show,
	hide : hide,
	setMessage : setMessage,
	applyProperties : applyProperties
});
