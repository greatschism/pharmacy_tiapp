var args = arguments[0] || {},
    clearButtonEnabled = false,
    triggerChange = true;

(function() {
	applyProperties(args);

	if (_.has(args, "leftIconText")) {
		setIcon(args.leftIconText, "left", args.leftIconDict || {}, args.leftIconAccessibility || {}, args.paddingLeft || 0);
	} else if (_.has(args, "leftButtonTitle")) {
		setButton(args.leftButtonTitle, "left", args.leftButtonDict || {}, args.leftButtonAccessibility || {}, args.paddingLeft || 0);
	}

	if (_.has(args, "rightIconText")) {
		setIcon(args.rightIconText, "right", args.rightIconDict || {}, args.rightIconAccessibility || {}, args.paddingRight || 0);
	} else if (args.clearButtonEnabled) {
		clearButtonEnabled = true;
		setIcon(args.clearIconText, "right", args.clearIconDict || args.rightIconDict || {}, args.clearIconAccessibility || {}, args.paddingRight || 0);
	} else if (_.has(args, "rightButtonTitle")) {
		setButton(args.rightButtonTitle, "right", args.rightButtonDict || {}, args.rightButtonAccessibility || {}, args.paddingRight || 0);
	}
})();

function setIcon(iconText, direction, iconDict, accessibility, padding) {
	var iconBtn = direction + "IconBtn";
	if ($[iconBtn]) {
		var dict = {
			title : iconText
		};
		_.extend(dict, iconDict);
		_.extend(dict, accessibility);
		$[iconBtn].applyProperties(dict);
		return true;
	}
	var font = args.iconFont || {
		fontSize : 12
	},
	    isClearButton = clearButtonEnabled && direction == "right";
	$.txt[direction] = ($.txt[direction] || 0) + (iconDict[direction] || 0) + (iconDict.width || font.fontSize || 0) + (padding || 0);
	iconDict[direction] = 0;
	_.defaults(iconDict, {
		width : $.txt[direction],
		font : font,
		title : iconText,
		sourceId : direction + "Icon",
		visible : !isClearButton
	});
	_.extend(iconDict, accessibility);
	$[iconBtn] = Ti.UI.createButton(iconDict);
	$[iconBtn].addEventListener("click", isClearButton ? didClickClearText : didClick);
	$.widget.add($[iconBtn]);
	if (isClearButton && direction == "right") {
		$.clearBtn = $[iconBtn];
	}
}

function setButton(title, direction, buttonDict, accessibility, padding) {
	var button = direction + "Btn";
	if ($[button]) {
		var dict = {
			title : title
		};
		_.extend(dict, buttonDict);
		_.extend(dict, accessibility);
		$[button].applyProperties(dict);
		return true;
	}
	var font = _.clone(args.buttonFont) || _.clone(args.font) || {
		fontSize : 12
	};
	$.txt[direction] = ($.txt[direction] || 0) + (buttonDict[direction] || 0) + (buttonDict.width || 40) + (padding || 0);
	buttonDict[direction] = 0;
	_.defaults(buttonDict, {
		width : $.txt[direction],
		font : font,
		title : title,
		sourceId : direction + "Button"
	});
	_.extend(buttonDict, accessibility);
	$[button] = Ti.UI.createButton(buttonDict);
	$[button].addEventListener("click", didClick);
	$.widget.add($[button]);
}

function applyProperties(dict) {
	var options = {};
	options = _.pick(dict, ["left", "right", "top", "bottom", "width", "height", "visible", "backgroundColor", "borderColor", "borderWidth", "borderRadius"]);
	if (!_.isEmpty(options)) {
		$.widget.applyProperties(options);
	}
	options = _.pick(dict, ["hintText", "value", "font", "color", "hintTextColor", "textAlign", "maxLength", "passwordMask", "autocorrect", "autocapitalization", "autoLink", "editable", "keyboardType", "returnKeyType", "suppressReturn", "enableReturnKey", "ellipsize", "accessibilityLabel", "accessibilityValue", "accessibilityHint", "accessibilityHidden"]);
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
		/**
		 * prevents the change event
		 * that fired as soon the value property
		 * is changed
		 */
		triggerChange = true;
		return;
	}
	if (clearButtonEnabled) {
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

function animate(dict, callback) {
	var animation = Ti.UI.createAnimation(dict);
	animation.addEventListener("complete", function onComplete() {
		animation.removeEventListener("complete", onComplete);
		if (callback) {
			callback($.widget);
		}
	});
	$.widget.animate(animation);
}

function setValue(value) {
	/**
	 * triggerChange = false
	 * will prevent the change event
	 * that fired as soon the value property
	 * is changed.
	 * Note: on iOS change events will be fired
	 * only when it is a change by user. Which is expected / standard
	 * On android change events will be fired as soon the value
	 * property is changed (Once the activity is ready).
	 */
	if (OS_ANDROID) {
		triggerChange = false;
	}
	$.txt.value = value;
	if (clearButtonEnabled) {
		$.clearBtn.visible = $.txt.value != "";
	}
}

function getValue() {
	return ($.txt.value || "").trim();
}

function setPasswordMask(value) {
	$.txt.passwordMask = value;
	var len = $.txt.value.length;
	setSelection(len, len);
}

function getPasswordMask() {
	return $.txt.passwordMask;
}

function setSelection(start, end) {
	if (OS_IOS || OS_ANDROID) {
		$.txt.setSelection(start, end);
	}
}

function addEventListener(event, callback) {
	$.widget.addEventListener(event, callback);
}

function removeEventListener(event, callback) {
	$.widget.removeEventListener(event, callback);
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
