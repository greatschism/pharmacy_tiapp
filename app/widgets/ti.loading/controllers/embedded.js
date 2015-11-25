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
	var options = _.pick(dict, ["top", "bottom", "left", "right", "width", "height", "layout", "backgroundColor", "backgroundImage", "borderColor", "borderRadius", "borderWidth", "touchEnabled"]);
	if (!_.isEmpty(options)) {
		$.embedded.applyProperties(options);
	}
	if (_.has(dict, "indicatorDict")) {
		$.activityIndicator.applyProperties(dict.indicatorDict);
	}
}

function show() {
	$.embedded.visible = true;
	$.activityIndicator.show();
}

function hide(remove) {
	$.activityIndicator.hide();
	$.embedded.visible = false;
	if (remove !== false) {
		$.embedded.getParent().remove($.embedded);
	}
}

_.extend($, {
	show : show,
	hide : hide,
	applyProperties : applyProperties
});
