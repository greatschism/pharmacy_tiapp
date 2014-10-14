var args = arguments[0] || {},
    _properties = {},
    _items = [];

(function() {

	var options = {};

	options = _.pick(args, ["width", "height", "top", "bottom", "left", "right", "backgroundColor", "borderColor", "borderWidth", "borderRadius", "zIndex", "opacity", "visible"]);
	if (!_.isEmpty(options)) {
		applyProperties(options);
	}

	options = _.pick(args, ["font", "color"]);
	if (!_.isEmpty(options)) {
		_.extend(_properties, options);
	}

	setItems(args.items || []);

})();

function didItemClick(e) {
	var itemIndex = OS_MOBILEWEB ? e.index : e.itemIndex;
	$.trigger("click", {
		index : itemIndex,
		data : _items[itemIndex] || {}
	});
	hide();
}

function applyProperties(dict) {
	$.widget.applyProperties(dict);
}

function getRow(data) {
	var row = $.UI.create("TableViewRow", {
		apiName : "TableViewRow",
		classes : ["row"]
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
	_properties.text = data.title;
	title.applyProperties(_properties);
	row.add(title);
	return row;
}

function setItems(items) {
	_items = items;
	var height = _items.length * 60;
	$.widget.height = height > 300 ? 300 : height;
	if (OS_IOS || OS_ANDROID) {
		var items = [];
		for (var i in _items) {
			var titleProp = {
				text : _items[i].title
			};
			_.extend(titleProp, _properties);
			items.push({
				title : titleProp,
				icon : {
					image : _items[i].image || ""
				},
				template : _items[i].image ? "icon" : "label",
				properties : {
					backgroundColor : "transparent",
					selectionStyle : OS_IOS ? Ti.UI.iPhone.ListViewCellSelectionStyle.NONE : false
				}
			});
		}
		$.section.setItems(items);
	} else {
		var data = [];
		for (var i in _items) {
			data.push(getRow({
				title : _items[i].title,
				image : _items[i].image || ""
			}));
		}
		$.listView.setData(data);
	}
}

function getItems() {
	return _items;
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
			$.widget.visible = false;
			$.widget.zIndex = 0;
			if (callback) {
				callback();
			}
		});
		$.widget.animate(animation);
	}
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
