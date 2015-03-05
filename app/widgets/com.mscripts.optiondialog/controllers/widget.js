var args = arguments[0] || {},
    SCREEN_HEIGHT = Ti.Platform.displayCaps.platformHeight,
    MAX_HEIGHT = (SCREEN_HEIGHT / 100) * 65,
    CONTAINER_HEIGHT = 0,
    properties = {},
    dialogOptions = [],
    cancelIndex = -1;

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

		$.role = args.role || "overlay";

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
		var itemIndex = e.index;
		$.trigger("click", {
			index : itemIndex,
			cancel : cancelIndex,
			data : dialogOptions[itemIndex] || {}
		});
		hide();
	}
}

function applyProperties(_dict) {
	$.containerView.applyProperties(_dict);
}

function getRow(_data) {
	var row = $.UI.create("TableViewRow", {
		height : 60
	});
	properties.text = _data.title;
	row.add($.UI.create("Label", properties));
	return row;
}

function setOptions(_options) {

	dialogOptions = _options;

	var len = dialogOptions.length,
	    height = (len * 60) + 30;

	CONTAINER_HEIGHT = height > MAX_HEIGHT ? MAX_HEIGHT : height;

	$.containerView.height = CONTAINER_HEIGHT + 2;

	var data = [];
	for (var i = 0; i < len; i++) {
		data.push(getRow(dialogOptions[i]));
	}
	$.listView.setData(data);

	if (Alloy.isHandheld) {
		$.containerView.top = SCREEN_HEIGHT;
	}
}

function getOptions() {
	return dialogOptions;
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
	if (OS_IOS || OS_ANDROID) {
		$.dialog.show();
	} else {
		if (!$.widget.visible) {
			$.widget.addEventListener("postlayout", function didPostlayout(e) {
				$.widget.removeEventListener("postlayout", didPostlayout);
				if (Alloy.isHandheld) {
					var top = SCREEN_HEIGHT - CONTAINER_HEIGHT,
					    animation = Ti.UI.createAnimation({
						top : top,
						duration : 300
					});
					animation.addEventListener("complete", function onComplete() {
						animation.removeEventListener("complete", onComplete);
						$.containerView.top = top;
						if (_callback) {
							_callback();
						}
					});
					$.containerView.animate(animation);
				} else {
					if (_callback) {
						_callback();
					}
				}
			});
			$.widget.applyProperties({
				visible : true,
				zIndex : args.zIndex || 1
			});
			return true;
		}
		return false;
	}
}

function hide(_callback) {
	if (OS_IOS || OS_ANDROID) {
		$.dialog.hide();
	} else {
		if ($.widget.visible) {
			if (Alloy.isHandheld) {
				var animation = Ti.UI.createAnimation({
					top : SCREEN_HEIGHT,
					duration : 300
				});
				animation.addEventListener("complete", function onComplete() {
					$.containerView.top = SCREEN_HEIGHT;
					$.widget.applyProperties({
						visible : false,
						zIndex : 0
					});
					if (_callback) {
						_callback();
					}
					animation.removeEventListener("complete", onComplete);
				});
				$.containerView.animate(animation);
			} else {
				$.widget.applyProperties({
					visible : false,
					zIndex : 0
				});
				if (_callback) {
					_callback();
				}
			}
			return true;
		}
		return false;
	}
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
exports.setOptions = setOptions;
exports.getOptions = getOptions;
exports.getVisible = getVisible;
exports.applyProperties = applyProperties;
