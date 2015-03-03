var args = arguments[0] || {},
    MAX_WIDTH = (Ti.Platform.displayCaps.platformWidth / 100) * 65,
    MAX_HEIGHT = (Ti.Platform.displayCaps.platformHeight / 100) * 65,
    items = [],
    titleProperty = args.titleProperty || "title",
    paddingLeft = args.paddingLeft || 12,
    optionPadding = {
	top : 12,
	bottom : 12,
	left : 12,
	right : 12,
	height : Ti.UI.SIZE,
	layout : "horizontal",
	horizontalWrap : false
},
    optioDict = {
	font : {
		fontSize : 12
	},
	ellipsize : true,
	wordWrap : false
};

if (OS_ANDROID) {
	MAX_WIDTH /= Ti.Platform.displayCaps.logicalDensityFactor;
	MAX_HEIGHT /= Ti.Platform.displayCaps.logicalDensityFactor;
}

(function() {

	$.role = args.role || "overlay";

	args.width = MAX_WIDTH;

	if (_.has(args, "optionPadding")) {
		_.extend(optionPadding, args.optionPadding);
	}

	if (_.has(args, "overlayDict")) {
		$.overlayView.applyProperties(args.overlayDict);
	}

	if (_.has(args, "top")) {
		$.overlayView.top = args.top;
		$.containerView.top = args.top - 2;
	}

	var options = {};
	options = _.pick(args, ["width", "height", "bottom", "left", "right", "borderColor", "borderWidth", "borderRadius"]);
	if (!_.isEmpty(options)) {
		$.containerView.applyProperties(options);
	}

	options = _.pick(args, ["backgroundColor", "separatorInsets"]);
	if (!_.isEmpty(options)) {
		$.tableView.applyProperties(options);
	}

	_.extend(optioDict, _.pick(args, ["color", "font"]));

	setItems(args.items || []);

})();

function didTap(e) {
	if (e.source == $.widget) {
		hide();
	}
}

function didItemClick(e) {
	var itemIndex = e.index;
	$.trigger("click", {
		source : $,
		index : itemIndex,
		data : items[itemIndex] || {}
	});
	hide();
}

function applyProperties(_dict) {
	$.containerView.applyProperties(_dict);
}

function getRow(_data) {
	var row = Ti.UI.createTableViewRow({
		height : Ti.UI.SIZE
	}),
	    rowView = Ti.UI.createView(optionPadding);
	if (_data.iconText) {
		rowView.add(Ti.UI.createLabel({
			text : _data.iconText,
			left : 0,
			font : args.iconFont || {
				fontSize : 12
			},
			color : _data.iconColor || args.iconColor || "#000"
		}));
	}
	rowView.add(Ti.UI.createLabel(_.extend(optioDict, {
		text : _data[titleProperty],
		left : _data.iconText ? paddingLeft : 0
	})));
	row.add(rowView);
	return row;
}

function setItems(_items) {
	items = _items;
	var height = items.length * (optionPadding.top + optionPadding.bottom + optioDict.font.fontSize + 5);
	$.containerView.height = height > MAX_HEIGHT ? MAX_HEIGHT : height;
	var data = [];
	for (var i in items) {
		data.push(getRow(items[i]));
	}
	$.tableView.setData(data);
}

function getItems() {
	return items;
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
			zIndex : args.zIndex || 10,
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
		return true;
	}
	return false;
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
		return true;
	}
	return false;
}

function toggle(_callback) {
	if ($.widget.visible) {
		hide(_callback);
	} else {
		show(_callback);
	}
}

function getVisible() {
	return $.widget.visible;
}

exports.show = show;
exports.hide = hide;
exports.toggle = toggle;
exports.animate = animate;
exports.setItems = setItems;
exports.getItems = getItems;
exports.getVisible = getVisible;
exports.applyProperties = applyProperties;
