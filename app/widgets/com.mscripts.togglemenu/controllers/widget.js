var args = arguments[0] || {},
    properties = {
	ellipsize : true,
	wordWrap : false
},
    items = [];

(function() {

	$.role = args.role || "";

	var options = {};

	options = _.pick(args, ["width", "height", "top", "bottom", "left", "right"]);
	if (!_.isEmpty(options)) {
		if (_.has(options, "top")) {
			options.top -= 15;
		}
		$.container.applyProperties(options);
	}

	options = {
		color : args.backgroundColor || "#fff",
		text : ")"
	};
	if (_.has(args, "edgeLbl")) {
		var edgeDict = args.edgeLbl;
		if (!_.has(edgeDict, "font")) {
			_.extend(edgeDict, {
				width : 24,
				height : 24,
				font : {
					fontFamily : "mscripts",
					fontSize : 24
				}
			});
		} else {
			_.extend(edgeDict, {
				width : edgeDict.font.fontSize,
				height : edgeDict.font.fontSize
			});
		}
		_.extend(options, edgeDict);
	}
	$.edgeLbl.applyProperties(options);

	options = {
		top : options.height - ( OS_MOBILEWEB ? 9 : 8)
	};
	_.extend(options, _.pick(args, ["backgroundColor", "borderColor", "borderWidth", "borderRadius"]));
	applyProperties(options);

	options = {
		backgroundColor : args.backgroundColor || "transparent",
		separatorColor : args.separatorColor || "transparent"
	};
	if (OS_IOS) {
		_.extend(options, {
			separatorInsets : {
				left : args.left || args.right || 16,
				right : args.left || args.right || 16
			}
		});
	}
	$.tableView.applyProperties(options);

	options = _.pick(args, ["font", "color"]);
	if (!_.isEmpty(options)) {
		_.extend(properties, options);
	}

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
		index : itemIndex,
		data : items[itemIndex] || {}
	});
	hide();
}

function applyProperties(dict) {
	$.listContainer.applyProperties(dict);
}

function getRow(data) {
	var row = Ti.UI.createTableViewRow({
		height : args.itemHeight
	});
	if (data.icon) {
		var iconLbl = Ti.UI.createLabel({
			text : data.icon,
			left : args.left || args.right || 16,
			width : args.iconWidth || 24,
			font : {
				fontFamily : "mscripts",
				fontSize : args.iconWidth || 24
			},
			color : properties.color || "#FFF"
		});
		row.add(iconLbl);
	}
	_.extend(properties, {
		text : data.title,
		left : iconLbl ? (iconLbl.width + (iconLbl.left * 2)) : (args.left || args.right || 16),
		right : args.left || args.right || 16
	});
	if (!_.has(properties, "font")) {
		_.extend(properties, {
			font : {
				fontSize : 18
			}
		});
	}
	row.add(Ti.UI.createLabel(properties));
	return row;
}

function setItems(_items) {
	items = _items;
	var height = (items.length * args.itemHeight) + $.edgeLbl.height;
	$.container.height = height > 330 ? 330 : height;
	var data = [];
	for (var i in items) {
		data.push(getRow({
			title : items[i].title,
			icon : items[i].icon || ""
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
		$.widget.visible = true;
		$.widget.zIndex = args.zIndex || 10;
		var animation = Ti.UI.createAnimation({
			opacity : 1,
			duration : 300
		});
		animation.addEventListener("complete", function onComplete() {
			animation.removeEventListener("complete", onComplete);
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
			$.widget.visible = false;
			$.widget.zIndex = 0;
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
