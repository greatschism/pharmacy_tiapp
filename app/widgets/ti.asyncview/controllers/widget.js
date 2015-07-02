var args = arguments[0] || {};

(function() {

	if (_.has(args, "role")) {
		$.widget.role = args.role;
	}

	var options = _.pick(args, ["top", "bottom", "left", "right", "width", "height", "layout", "backgroundColor", "backgroundImage", "borderColor", "borderRadius", "borderWidth"]);
	if (!_.isEmpty(options)) {
		applyProperties(options);
	}

	if (_.has(args, "indicatorDict")) {
		$.activityIndicatorImg.applyProperties(args.indicatorDict);
	}

	if (args.visible !== false) {
		show(args.images || Alloy.Globals.spinnerImages || []);
	}

})();

function applyProperties(dict) {
	$.widget.applyProperties(dict);
}

function show(images) {
	if ($.activityIndicatorImg && images) {
		$.activityIndicatorImg.addEventListener("load", didLoad);
		$.activityIndicatorImg.images = images;
	}
}

function didLoad() {
	if ($.activityIndicatorImg) {
		$.activityIndicatorImg.start();
		$.activityIndicatorImg.removeEventListener("load", didLoad);
	}
}

function hide(children) {
	if ($.activityIndicatorImg) {
		$.activityIndicatorImg.stop();
		$.widget.remove($.activityIndicatorImg);
		$.activityIndicatorImg = null;
	}
	children = children || args.children;
	_.each(children, function(child) {
		if (child.__iamalloy) {
			child = child.getView();
		}
		if (!child) {
			return;
		}
		$.widget.add(child);
	});
	if (args.children) {
		delete args.children;
	}
}

exports.show = show;
exports.hide = hide;
exports.applyProperties = applyProperties;
