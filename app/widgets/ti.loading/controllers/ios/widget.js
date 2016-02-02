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
	var options = _.pick(dict, ["top", "bottom", "left", "right", "width", "height", "layout", "backgroundColor", "backgroundImage", "borderColor", "borderRadius", "borderWidth"]);
	if (!_.isEmpty(options)) {
		$.widget.applyProperties(options);
	}
	if (_.has(dict, "indicatorDict")) {
		$.activityIndicator.applyProperties(dict.indicatorDict);
	}
	if (_.has(dict, "message")) {
		setMessage(dict.message);
	}
}

function didOpen(e) {
	isOpened = true;
	if (isCloseRequested) {
		hide();
	}
}

function setMessage(message) {
	$.activityIndicator.message = message;
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
		$.activityIndicator.hide();
	}
}

_.extend($, {
	show : show,
	hide : hide,
	setMessage : setMessage,
	applyProperties : applyProperties
});
