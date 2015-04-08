var args = arguments[0] || {},
    triggerChange = true;

(function() {

	applyProperties(args);

	if (_.has(args, "value")) {
		setValue(args.value);
	}

})();

function applyProperties(_dict) {
	var options = {};
	options = _.pick(_dict, ["left", "right", "top", "bottom", "width", "height", "visible", "backgroundColor", "borderColor", "borderWidth", "borderRadius"]);
	if (!_.isEmpty(options)) {
		$.widget.applyProperties(options);
	}
	if (OS_IOS) {
		if (_.has(_dict, "hintText")) {
			options = _.pick(_dict, ["font", "textAlign", "accessibilityHidden"]);
			_.extend(options, {
				text : _dict.hintText
			});
			if (_.has(_dict, "hintTextColor")) {
				_.extend(options, {
					color : _dict.hintTextColor
				});
			}
			$.hintLbl.applyProperties(options);
		} else {
			$.widget.remove($.hintLbl);
		}
	}
	options = _.pick(_dict, ["hintText", "value", "font", "color", "textAlign", "maxLength", "passwordMask", "autocorrect", "autocapitalization", "autoLink", "editable", "keyboardType", "returnKeyType", "suppressReturn", "enableReturnKey", "ellipsize", "accessibilityLabel", "accessibilityValue", "accessibilityHint", "accessibilityHidden"]);
	if (!_.isEmpty(options)) {
		$.txta.applyProperties(options);
	}
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
	if (OS_IOS && $.hintLbl) {
		$.hintLbl.visible = $.txta.value == "";
	}
	$.trigger("change", {
		source : $,
		value : ($.txta.value || "").trim()
	});
}

function didReturn(e) {
	$.trigger("return", {
		source : $,
		nextItem : args.nextItem || ""
	});
}

function focus() {
	$.txta.focus();
}

function blur() {
	$.txta.blur();
}

function setValue(_value) {
	if (OS_ANDROID) {
		triggerChange = false;
	}
	$.txta.value = _value;
	if (OS_IOS && $.hintLbl) {
		$.hintLbl.visible = $.txta.value == "";
	}
}

function getValue() {
	return ($.txta.value || "").trim();
}

function setSelection(_start, _end) {
	if (OS_IOS || OS_ANDROID) {
		$.txta.setSelection(_start, _end);
	}
}

exports.blur = blur;
exports.focus = focus;
exports.setValue = setValue;
exports.getValue = getValue;
exports.setSelection = setSelection;
exports.applyProperties = applyProperties;
