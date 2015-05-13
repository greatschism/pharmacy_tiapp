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

function updateArrow(_direction, _dict) {
	var dict = {
		text : args.iconText || _dict.iconText || "%",
		font : _dict.font || args.iconFont || {
			fontSize : 12
		},
		color : _dict.color || "#000",
		accessibilityHidden : true
	};
	_.extend(dict, _.pick(args, ["borderColor", "borderWidth", "borderRadius"]));
	$.arrowLbl.applyProperties(dict);
	$.arrowLbl[_direction] = 0;
	$.contentView[_direction] = $.arrowLbl.font.fontSize - (args.arrowPadding || 8);
}

function applyProperties(_dict) {
	$.widget.addEventListener("postlayout", didPostlayout);
	$.widget.applyProperties(_dict);
}

function didPostlayout(e) {
	$.widget.removeEventListener("postlayout", didPostlayout);
	$.trigger("postlayout", {
		source : $,
		rect : e.source.rect,
		size : e.source.size
	});
}

function animate(_dict, _callback) {
	var animation = Ti.UI.createAnimation(_dict);
	animation.addEventListener("complete", function onComplete() {
		animation.removeEventListener("complete", onComplete);
		if (_callback) {
			_callback();
		}
	});
	$.widget.animate(animation);
}

function show(_callback) {
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
			if (_callback) {
				_callback();
			}
		});
		$.widget.animate(animation);
	}
}

function hide(_callback) {
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
			if (_callback) {
				_callback();
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

function setPadding(_height) {
	$.contentView.add(Ti.UI.createLabel({
		height : _height,
		touchEnabled : false,
		accessibilityHidden : true
	}));
}

function setText(_text, _styles, _accessibilityLabel, _accessibilityHidden) {
	removeAllChildren();
	var dict = _styles || args.labelDict || {};
	_.extend(dict, {
		font : _.clone(args.font) || {
			fontSize : 12
		},
		text : _text,
		touchEnabled : false,
		accessibilityHidden : _.isUndefined(_accessibilityHidden) ? false : _accessibilityHidden,
		accessibilityLabel : _accessibilityHidden !== true && _accessibilityLabel ? _accessibilityLabel : null
	});
	if (dict.paddingTop) {
		setPadding(dict.paddingTop);
	}
	$.contentView.add(Ti.UI.createLabel(dict));
	if (dict.paddingBottom) {
		setPadding(dict.paddingBottom);
	}
}

function setContentView(_view, _styles) {
	removeAllChildren();
	var dict = _styles || args.labelDict || {};
	if (dict.paddingTop) {
		setPadding(dict.paddingTop);
	}
	$.contentView.add(_view);
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
