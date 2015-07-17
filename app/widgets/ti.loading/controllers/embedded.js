var args = arguments[0] || {},
    isOpened = false,
    isCloseRequested = false;

(function() {
	applyProperties(args);
	if (args.visible !== false) {
		show(args.spinnerImages || Alloy.Globals.spinnerImages || null);
	}
})();

function applyProperties(dict) {
	var options = _.pick(dict, ["top", "bottom", "left", "right", "width", "height", "layout", "backgroundColor", "backgroundImage", "borderColor", "borderRadius", "borderWidth", "touchEnabled"]);
	if (!_.isEmpty(options)) {
		$.embedded.applyProperties(options);
	}
	if (_.has(dict, "indicatorDict")) {
		$.activityIndicatorImg.applyProperties(dict.indicatorDict);
	}
}

function show(images, dict) {
	if (dict) {
		dict.visible = true;
		$.embedded.applyProperties(dict);
	} else {
		$.embedded.visible = true;
	}
	if (images) {
		$.activityIndicatorImg.addEventListener("load", didLoad);
		$.activityIndicatorImg.images = images;
	} else {
		$.activityIndicatorImg.start();
	}
}

function didLoad() {
	$.activityIndicatorImg.start();
	$.activityIndicatorImg.removeEventListener("load", didLoad);
}

function hide(remove) {
	$.activityIndicatorImg.stop();
	$.embedded.visible = false;
	if (remove !== false) {
		$.embedded.getParent().remove($.embedded);
	}
}

exports.show = show;
exports.hide = hide;
exports.applyProperties = applyProperties;
