var args = arguments[0] || {};

(function() {

	var options = _.pick(args, ["layout", "backgroundColor", "borderColor", "borderWidth", "borderRadius"]);
	if (!_.isEmpty(options)) {
		$.contentView.applyProperties(options);
	}

	updateArrow(args.direction || "bottom", args.arrowDict || {});

	if (_.has(args, "text")) {
		setText(args.text, null, args.accessibilityLabel, args.accessibilityHidden);
	}

	options = _.pick(args, ["width", "height", "top", "bottom", "left", "right"]);
	if (args.visible) {
		_.extend(options, {
			visible : true,
			opacity : 1,
			zIndex : args.zIndex || 1
		});
	}
	if (!_.isEmpty(options)) {
		applyProperties(options);
	}

})();

function updateArrow(direction, dict) {
	var dict = {
		text : args.iconText || dict.iconText || "%",
		font : dict.font || args.iconFont || {
			fontSize : 12
		},
		color : dict.color || "#000",
		accessibilityHidden : true
	};
	_.extend(dict, _.pick(args, ["borderColor", "borderWidth", "borderRadius"]));
	$.arrowLbl.applyProperties(dict);
	$.arrowLbl[direction] = 0;
	$.contentView[direction] = $.arrowLbl.font.fontSize - (args.arrowPadding || 8);
}

function applyProperties(dict) {
	$.widget.addEventListener("postlayout", didPostlayout);
	$.widget.applyProperties(dict);
}

function didPostlayout(e) {
	$.widget.removeEventListener("postlayout", didPostlayout);
	$.trigger("postlayout", {
		source : $,
		rect : e.source.rect,
		size : e.source.size
	});
}

function animate(dict, callback) {
	var animation = Ti.UI.createAnimation(dict);
	animation.addEventListener("complete", function onComplete() {
		animation.removeEventListener("complete", onComplete);
		if (callback) {
			callback();
		}
	});
	$.widget.animate(animation);
}

function show(callback) {
	if (!$.widget.visible) {
		$.widget.applyProperties({
			visible : true,
			zIndex : args.zIndex || 1
		});
		var animation = Ti.UI.createAnimation({
			opacity : 1,
			duration : 300
		});
		animation.addEventListener("complete", function onComplete() {
			animation.removeEventListener("complete", onComplete);
			$.widget.opacity = 1;
			if (callback) {
				callback();
			}
		});
		$.widget.animate(animation);
	}
}

function hide(callback) {
	if ($.widget.visible) {
		var animation = Ti.UI.createAnimation({
			opacity : 0,
			duration : 300
		});
		animation.addEventListener("complete", function onComplete() {
			animation.removeEventListener("complete", onComplete);
			$.widget.applyProperties({
				opacity : 0,
				visible : false,
				zIndex : 0
			});
			if (callback) {
				callback();
			}
		});
		$.widget.animate(animation);
	}
}

function getVisible() {
	return $.widget.visible;
}

function removeAllChildren() {
	var children = $.contentView.children;
	for (var i in children) {
		$.contentView.remove(children[i]);
	}
}

function setPadding(height) {
	$.contentView.add(Ti.UI.createLabel({
		height : height,
		touchEnabled : false,
		accessibilityHidden : true
	}));
}

function setText(text, styles, accessibilityLabel, accessibilityHidden) {
	removeAllChildren();
	var dict = styles || args.labelDict || {};
	_.extend(dict, {
		font : _.clone(args.font) || {
			fontSize : 12
		},
		text : text,
		touchEnabled : false,
		accessibilityHidden : _.isUndefined(accessibilityHidden) ? false : accessibilityHidden,
		accessibilityLabel : accessibilityHidden !== true && accessibilityLabel ? accessibilityLabel : null
	});
	if (dict.paddingTop) {
		setPadding(dict.paddingTop);
	}
	$.contentView.add(Ti.UI.createLabel(dict));
	if (dict.paddingBottom) {
		setPadding(dict.paddingBottom);
	}
}

function setContentView(view, styles) {
	removeAllChildren();
	var dict = styles || args.labelDict || {};
	if (dict.paddingTop) {
		setPadding(dict.paddingTop);
	}
	$.contentView.add(view);
	if (dict.paddingBottom) {
		setPadding(dict.paddingBottom);
	}
}

function didClick(e) {
	$.trigger("click", {
		source : $
	});
}

exports.show = show;
exports.hide = hide;
exports.animate = animate;
exports.setText = setText;
exports.getVisible = getVisible;
exports.setContentView = setContentView;
exports.applyProperties = applyProperties;
