var args = arguments[0] || {},
    isOpened = false,
    isCloseRequested = false,
    images = args.spinnerImages || Alloy.Globals.spinnerImages || null;

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
		$.activityIndicatorImg.applyProperties(dict.indicatorDict);
	}
}

function show(imgs, dict) {
	if (imgs) {
		images = imgs;
	}
	if (images) {
		if (dict) {
			dict.visible = true;
			$.embedded.applyProperties(dict);
		} else {
			$.embedded.visible = true;
		}
		$.activityIndicatorImg.addEventListener("load", didLoad);
		$.activityIndicatorImg.images = images;
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
