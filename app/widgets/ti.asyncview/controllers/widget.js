var args = $.args;

(function() {
	if (_.has(args, "role")) {
		$.widget.role = args.role;
	}
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
}

function show() {
	$.activityIndicator.show();
}

function hide(children) {
	if ($.activityIndicator) {
		$.activityIndicator.hide();
		$.widget.remove($.activityIndicator);
		$.activityIndicator = null;
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

_.extend($, {
	show : show,
	hide : hide,
	applyProperties : applyProperties
});
