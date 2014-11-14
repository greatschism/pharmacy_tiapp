var args = arguments[0] || {},
    CONTAINER_HEIGHT = 0,
    height = Ti.Platform.displayCaps.platformHeight,
    properties = {},
    options = [];

(function() {

	if (OS_IOS || OS_ANDROID) {

		$.dialog = Ti.UI.createOptionDialog({
			options : _.pluck(args.options, "title"),
			cancel : args.cancel || -1
		});
		if (OS_ANDROID) {
			$.dialog.title = args.title || "Choose one";
		}
		$.dialog.addEventListener("click", didItemClick);

	} else {

		$.role = args.role || "";

		var options = {};

		options = _.pick(args, ["width", "height", "top", "bottom", "left", "right", "backgroundColor", "borderColor", "borderWidth", "borderRadius"]);
		if (!_.isEmpty(options)) {
			applyProperties(options);
		}

		options = _.pick(args, ["font", "color"]);
		if (!_.isEmpty(options)) {
			_.extend(properties, options);
		}

		$.titleLbl.text = args.title || "Choose one";

		if (OS_ANDROID) {
			height /= Ti.Platform.displayCaps.logicalDensityFactor;
		}

		setOptions(args.options || []);
	}

})();

function didTap(e) {
	if (e.source == $.widget) {
		hide();
	}
}

function didItemClick(e) {
	if (OS_IOS || OS_ANDROID) {
		$.trigger("click", e);
	} else {
		var itemIndex = OS_MOBILEWEB ? e.index : e.itemIndex;
		$.trigger("click", {
			index : itemIndex,
			cancel : args.cancel,
			data : options[itemIndex] || {}
		});
		hide();
	}
}

function applyProperties(dict) {
	$.container.applyProperties(dict);
}

function getRow(data) {
	var row = $.UI.create("TableViewRow", {
		apiName : "TableViewRow",
		classes : ["height-48d"]
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

function setOptions(_options) {

	options = _options;

	var len = Alloy.isHandheld ? options.length : options.length - 1;

	var height = (len * 60) + 30;
	CONTAINER_HEIGHT = height > 330 ? 330 : height;
	$.container.height = CONTAINER_HEIGHT + 2;

	if (OS_IOS || OS_ANDROID) {
		var data = [];
		for (var i = 0; i < len; i++) {
			var titleProp = {
				text : options[i].title
			};
			_.extend(titleProp, properties);
			data.push({
				title : titleProp,
				icon : {
					image : options[i].image || ""
				},
				template : options[i].image ? "icon" : "label",
				properties : {
					backgroundColor : "transparent",
					selectionStyle : OS_IOS ? Ti.UI.iPhone.ListViewCellSelectionStyle.NONE : false
				}
			});
		}
		$.section.setItems(data);
	} else {
		var data = [];
		for (var i = 0; i < len; i++) {
			data.push(getRow({
				title : options[i].title,
				image : options[i].image || ""
			}));
		}
		$.listView.setData(data);
	}

	if (Alloy.isHandheld) {
		$.container.top = height + CONTAINER_HEIGHT;
	}
}

function getOptions() {
	return options;
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
	if (OS_IOS || OS_ANDROID) {
		$.dialog.show();
	} else {
		if (!$.widget.visible) {
			$.widget.visible = true;
			$.widget.zIndex = args.zIndex || 1;
			if (Alloy.isHandheld) {
				var top = height - CONTAINER_HEIGHT;
				var animation = Ti.UI.createAnimation({
					top : top,
					duration : 300
				});
				animation.addEventListener("complete", function onComplete() {
					$.container.top = top;
					if (callback) {
						callback();
					}
					animation.removeEventListener("complete", onComplete);
				});
				$.container.animate(animation);
			} else {
				if (callback) {
					callback();
				}
			}
			return true;
		}
		return false;
	}
}

function hide(callback) {
	if (OS_IOS || OS_ANDROID) {
		$.dialog.hide();
	} else {
		if ($.widget.visible) {
			if (Alloy.isHandheld) {
				var top = height + CONTAINER_HEIGHT;
				var animation = Ti.UI.createAnimation({
					top : top,
					duration : 300
				});
				animation.addEventListener("complete", function onComplete() {
					$.container.top = top;
					$.widget.visible = false;
					$.widget.zIndex = 0;
					if (callback) {
						callback();
					}
					animation.removeEventListener("complete", onComplete);
				});
				$.container.animate(animation);
			} else {
				$.widget.visible = false;
				$.widget.zIndex = 0;
				if (callback) {
					callback();
				}
			}
			return true;
		}
		return false;
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
exports.setOptions = setOptions;
exports.getOptions = getOptions;
exports.getVisible = getVisible;
exports.applyProperties = applyProperties;
