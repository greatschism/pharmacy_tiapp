var args = arguments[0] || {},
    enableClearButton = false,
    triggerChange = true;

(function() {
	applyProperties(args);

	if (_.has(args, "leftIconText")) {
		setIcon(args.leftIconText, "left", args.leftIconDict || {}, args.paddingLeft || 0);
	} else if (_.has(args, "leftButtonTitle")) {
		setButton(args.leftButtonTitle, "left", args.leftButtonDict || {}, args.paddingLeft || 0);
	}

	if (_.has(args, "rightIconText")) {
		setIcon(args.rightIconText, "right", args.rightIconDict || {}, args.paddingRight || 0);
	} else if (args.enableClearButton) {
		enableClearButton = true;
		setIcon(args.clearIconText, "right", args.clearIconDict || args.rightIconDict || {}, args.paddingRight || 0);
	} else if (_.has(args, "rightButtonTitle")) {
		setButton(args.rightButtonTitle, "right", args.rightButtonDict || {}, args.paddingRight || 0);
	}
})();

function setIcon(_iconText, _direction, _iconDict, _padding) {
	var font = args.iconFont || {
		fontSize : 12
	},
	    isClearButton = enableClearButton && _direction == "right";
	$.txt[_direction] = $.txt[_direction] + (_iconDict[_direction] || 0) + font.fontSize + _padding;
	var iconView = Ti.UI.createView({
		width : $.txt[_direction],
		sourceId : _direction + "Icon",
		visible : !isClearButton
	});
	iconView[_direction] = 0;
	_.extend(_iconDict, {
		font : font,
		text : _iconText,
		touchEnabled : false
	});
	iconView.add(Ti.UI.createLabel(_iconDict));
	iconView.addEventListener("click", isClearButton ? didClickClearText : didClick);
	$.widget.add(iconView);
	if (isClearButton) {
		$.clearBtn = iconView;
	}
}

function setButton(_title, _direction, _buttonDict, _padding) {
	var font = _.clone(args.buttonFont) || _.clone(args.font) || {
		fontSize : 12
	};
	$.txt[_direction] = $.txt[_direction] + (_buttonDict[_direction] || 0) + (_buttonDict.width || 40) + _padding;
	var buttonView = Ti.UI.createView({
		width : $.txt[_direction],
		sourceId : _direction + "Button"
	});
	buttonView[_direction] = 0;
	_.extend(_buttonDict, {
		height : font.fontSize + 5,
		ellipsize : true,
		wordWrap : false,
		width : _buttonDict.width || Ti.UI.FILL,
		textAlign : _buttonDict.textAlign || "center",
		font : font,
		text : _title,
		touchEnabled : false
	});
	buttonView.add(Ti.UI.createLabel(_buttonDict));
	buttonView.addEventListener("click", didClick);
	$.widget.add(buttonView);
}

function applyProperties(_dict) {
	var options = {};
	options = _.pick(_dict, ["left", "right", "top", "bottom", "width", "height", "visible", "backgroundColor", "borderColor", "borderWidth", "borderRadius"]);
	if (!_.isEmpty(options)) {
		$.widget.applyProperties(options);
	}
	options = _.pick(_dict, ["hintText", "value", "font", "color", "textAlign", "maxLength", "passwordMask", "autocorrect", "autocapitalization", "autoLink", "editable", "keyboardType", "returnKeyType", "suppressReturn", "enableReturnKey", "ellipsize"]);
	if (!_.isEmpty(options)) {
		$.txt.applyProperties(options);
	}
}

function didClickClearText(e) {
	setValue("");
	$.trigger("clear", {
		source : $,
		clicksource : "clearButton"
	});
}

function didClick(e) {
	$.trigger("click", {
		source : $,
		clicksource : e.source.sourceId
	});
}

function didFocus(e) {
	$.trigger("focus", {
		source : $
	});
}

function didBlur(e) {
	$.trigger("blur", {
		source : $
	});
}

function didChange(e) {
	if (OS_ANDROID && !triggerChange) {
		triggerChange = true;
		return;
	}
	if (enableClearButton) {
		$.clearBtn.visible = $.txt.value != "";
	}
	$.trigger("change", {
		source : $,
		value : ($.txt.value || "").trim()
	});
}

function didReturn(e) {
	$.trigger("return", {
		source : $,
		nextItem : args.nextItem || ""
	});
}

function focus() {
	$.txt.focus();
}

function blur() {
	$.txt.blur();
}

function animate(animationProp, callback) {
	var animation = Ti.UI.createAnimation(animationProp);
	animation.addEventListener("complete", function onComplete() {
		animation.removeEventListener("complete", onComplete);
		if (callback) {
			callback($.widget);
		}
	});
	$.widget.animate(animation);
}

function setValue(_value) {
	if (OS_ANDROID) {
		triggerChange = false;
	}
	$.txt.value = _value;
	if (enableClearButton) {
		$.clearBtn.visible = $.txt.value != "";
	}
}

function getValue() {
	return ($.txt.value || "").trim();
}

function setPasswordMask(_value) {
	$.txt.passwordMask = _value;
	var len = $.txt.value.length;
	setSelection(len, len);
}

function getPasswordMask() {
	return $.txt.passwordMask;
}

function setSelection(_start, _end) {
	if (OS_IOS || OS_ANDROID) {
		$.txt.setSelection(_start, _end);
	}
}

function addEventListener(_event, _callback) {
	$.widget.addEventListener(_event, _callback);
}

function removeEventListener(_event, _callback) {
	$.widget.removeEventListener(_event, _callback);
}

exports.blur = blur;
exports.focus = focus;
exports.animate = animate;
exports.setIcon = setIcon;
exports.setButton = setButton;
exports.setValue = setValue;
exports.getValue = getValue;
exports.setSelection = setSelection;
exports.setPasswordMask = setPasswordMask;
exports.getPasswordMask = getPasswordMask;
exports.applyProperties = applyProperties;
exports.addEventListener = addEventListener;
exports.removeEventListener = removeEventListener;
