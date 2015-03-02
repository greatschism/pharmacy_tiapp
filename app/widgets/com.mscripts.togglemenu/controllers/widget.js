var args = arguments[0] || {},
    MAX_WIDTH = (Ti.Platform.displayCaps.platformWidth / 100) * 65,
    MAX_HEIGHT = (Ti.Platform.displayCaps.platformHeight / 100) * 65,
    items = [],
    optionPadding = args.optionPadding || {},
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

function applyProperties(dict) {
	$.containerView.applyProperties(dict);
}

function getRow(data) {
	var row = Ti.UI.createTableViewRow({
		height : Ti.UI.SIZE
	}),
	    rowView = Ti.UI.createView(optionPadding);
	rowView.applyProperties({
		height : Ti.UI.SIZE,
		layout : "horizontal"
	});
	if (data.iconText) {
		rowView.add(Ti.UI.createLabel({
			text : data.iconText,
			left : 0,
			font : args.iconFont || {
				fontSize : 12
			},
			color : data.iconColor
		}));
	}
	rowView.add(Ti.UI.createLabel(_.extend(optioDict, {
		text : data.title,
		left : data.iconText ? optionPadding.left || 12 : 0
	})));
	row.add(rowView);
	return row;
}

function setItems(_items) {
	items = _items;
	var top = optionPadding.top || 0,
	    bottom = optionPadding.bottom || 0,
	    height = items.length * (top + bottom + optioDict.font.fontSize + 5);
	$.containerView.height = height > MAX_HEIGHT ? MAX_HEIGHT : height;
	var data = [];
	for (var i in items) {
		data.push(getRow({
			title : items[i].title,
			iconText : items[i].iconText || "",
			iconColor : items[i].iconColor || optioDict.color || "#000"
		}));
	}
	$.tableView.setData(data);
}

function getItems() {
	return items;
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
			zIndex : args.zIndex || 10,
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
		return true;
	}
	return false;
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
		return true;
	}
	return false;
}

function toggle(callback) {
	if ($.widget.visible) {
		hide(callback);
	} else {
		show(callback);
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
