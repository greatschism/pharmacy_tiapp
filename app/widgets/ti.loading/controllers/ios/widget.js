var args = arguments[0] || {},
    isOpened = false,
    isCloseRequested = false;

(function() {
	applyProperties(args);
	if (args.visible !== false) {
		show(args.spinnerImages || Alloy.Globals.spinnerImages || []);
	}
})();

function applyProperties(dict) {
	var options = _.pick(dict, ["top", "bottom", "left", "right", "width", "height", "layout", "backgroundColor", "backgroundImage", "borderColor", "borderRadius", "borderWidth"]);
	if (!_.isEmpty(options)) {
		$.widget.applyProperties(options);
	}
	if (_.has(dict, "indicatorDict")) {
		$.activityIndicatorImg.applyProperties(dict.indicatorDict);
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
	$.messageLbl.text = message;
}

function show(images) {
	if ($.activityIndicatorImg && images) {
		$.activityIndicatorImg.addEventListener("load", didLoad);
		$.activityIndicatorImg.images = images;
	}
	$.window.open({
		animated : false
	});
}

function didLoad() {
	if ($.activityIndicatorImg) {
		$.activityIndicatorImg.start();
		$.activityIndicatorImg.removeEventListener("load", didLoad);
	}
}

function hide() {
	isCloseRequested = true;
	if (isOpened) {
		if ($.activityIndicatorImg) {
			$.activityIndicatorImg.stop();
		}
		$.window.close({
			animated : false
		});
	}
}

exports.show = show;
exports.hide = hide;
exports.setMessage = setMessage;
exports.applyProperties = applyProperties;
