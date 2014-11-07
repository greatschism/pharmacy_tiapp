var args = arguments[0] || {},
    properties = {},
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

	options = _.pick(args, ["backgroundColor", "borderColor", "borderWidth", "borderRadius"]);
	if (!_.isEmpty(options)) {
		applyProperties(options);
	}

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
	var itemIndex = OS_MOBILEWEB ? e.index : e.itemIndex;
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
	var row = $.UI.create("TableViewRow", {
		apiName : "TableViewRow",
		classes : ["height-60d"]
	});
	if (data.image) {
		var image = $.UI.create("ImageView", {
			apiName : "ImageView",
			classes : ["icon"]
		});
		image.image = data.image;
		row.add(image);
	}
	var title = $.UI.create("Label", {
		apiName : "Label",
		classes : [data.image ? "icon-title" : "title"]
	});
	properties.text = data.title;
	title.applyProperties(properties);
	row.add(title);
	return row;
}

function setItems(_items) {
	items = _items;
	var height = (items.length * 60) + 40;
	$.container.height = height > 330 ? 330 : height;
	if (OS_IOS || OS_ANDROID) {
		var data = [];
		for (var i in items) {
			var titleProp = {
				text : items[i].title
			};
			_.extend(titleProp, properties);
			data.push({
				title : titleProp,
				icon : {
					image : items[i].image || ""
				},
				template : items[i].image ? "icon" : "label",
				properties : {
					backgroundColor : "transparent",
					selectionStyle : OS_IOS ? Ti.UI.iPhone.ListViewCellSelectionStyle.NONE : false
				}
			});
		}
		$.section.setItems(data);
	} else {
		var data = [];
		for (var i in items) {
			data.push(getRow({
				title : items[i].title,
				image : items[i].image || ""
			}));
		}
		$.listView.setData(data);
	}
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
		$.widget.zIndex = args.zIndex || 1;
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
