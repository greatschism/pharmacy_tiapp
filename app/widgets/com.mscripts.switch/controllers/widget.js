var args = arguments[0] || {},
    busy = false,
    currentValue,
    touchStartX = 0,
    disabledLeft = 2,
    enabledLeft,
    disabledColor,
    enabledColor;

(function() {

	var options = {};

	options = _.pick(args, ["width", "height", "top", "bottom", "left", "right", "borderColor", "borderWidth", "borderRadius", "accessibilityLabel", "accessibilityValue", "accessibilityHint", "accessibilityHidden"]);
	if (!_.isEmpty(options)) {
		if (OS_ANDROID) {
			$.widget.applyProperties(options);
		} else {
			$.swt.applyProperties(options);
		}
	}

	if (OS_ANDROID) {
		options = _.pick(args, ["height", "borderRadius"]);
		if (!_.isEmpty(options) || _.has(args, "thumbWidth")) {
			options.width = args.thumbWidth || args.height || $.widget.height;
			$.swt.applyProperties(options);
		}
		enabledLeft = $.widget.width - ($.swt.width + 2);
	}

	if (_.has(args, "thumbColor")) {
		if (OS_ANDROID) {
			$.swt.backgroundColor = args.thumbColor;
		} else {
			$.swt.knobColor = args.thumbColor;
		}
	}

	disabledColor = args.disabledColor || args.backgroundColor || "#CAC4C1";
	enabledColor = args.enabledColor || "#69D669";

	if (OS_IOS) {
		$.swt.applyProperties({
			inactiveColor : disabledColor,
			activeColor : enabledColor
		});
	}

	setValue(args.value || false, false);

	if (OS_ANDROID) {
		updateAccessibility(false);
	}

})();

function didTouchcancel(e) {
	$.trigger("touch", {
		source : $,
		value : true
	});
	busy = true;
	touchStartX = e.x;
	if (currentValue) {
		enabledSwt(true);
	} else {
		disableSwt(true);
	}
}

function didTouchstart(e) {
	if (!busy) {
		$.trigger("touch", {
			source : $,
			value : false
		});
		touchStartX = e.x;
	}
}

function didTouchmove(e) {
	if (!busy) {
		var coords = $.swt.convertPointToView({
			x : e.x,
			y : e.y
		}, $.bgView);
		var newLeft = coords.x - touchStartX;
		if (newLeft > enabledLeft) {
			newLeft = enabledLeft;
		} else if (newLeft < disabledLeft) {
			newLeft = disabledLeft;
		}
		$.swt.left = newLeft;
	}
}

function didTouchend(e) {
	if (!busy) {
		$.trigger("touch", {
			source : $,
			value : true
		});
		busy = true;
		var left = $.swt.left;
		if (left == enabledLeft || left == disabledLeft) {
			var value = left == enabledLeft ? true : false;
			busy = false;
			setValue(value);
		} else {
			currentValue = !currentValue;
			if (currentValue) {
				enabledSwt(true);
			} else {
				disableSwt(true);
			}
		}
		triggerChange();
	}
}

function didSingletap(e) {
	if (!busy) {
		var value = !currentValue;
		if (setValue(value)) {
			triggerChange();
		}
	}
}

function triggerChange() {
	updateAccessibility();
	$.trigger("change", {
		source : $,
		value : currentValue
	});
}

function updateAccessibility(_fireEvent) {
	var accessibilityLabel = currentValue ? args.accessibilityLabelOn || "Switch on" : args.accessibilityLabelOff || "Switch off";
	$.widget.accessibilityLabel = accessibilityLabel;
	if (Ti.App.accessibilityEnabled && _fireEvent !== false) {
		//Ti.App.fireSystemEvent(Ti.App.EVENT_ACCESSIBILITY_LABEL_CHANGED, $.widget);
	}
}

function didChange(e) {
	currentValue = e.value;
	$.trigger("change", {
		source : $,
		value : currentValue
	});
}

function setValue(_value, _animate) {
	if (currentValue != _value && busy == false) {
		currentValue = _value;
		if (OS_ANDROID) {
			busy = true;
			if (currentValue) {
				enabledSwt(_animate);
			} else {
				disableSwt(_animate);
			}
		} else {
			$.swt.setValue(currentValue);
		}
		return true;
	}
	return false;
}

function enabledSwt(_animate) {
	if (_animate !== false) {
		var animation = Ti.UI.createAnimation({
			left : enabledLeft,
			duration : 300
		});
		animation.addEventListener("complete", function onComplete() {
			animation.removeEventListener("complete", onComplete);
			$.bgView.backgroundColor = enabledColor;
			$.swt.left = enabledLeft;
			busy = false;
		});
		$.swt.animate(animation);
	} else {
		$.bgView.backgroundColor = enabledColor;
		$.swt.left = enabledLeft;
		busy = false;
	}
}

function disableSwt(_animate) {
	if (_animate !== false) {
		var animation = Ti.UI.createAnimation({
			left : disabledLeft,
			duration : 300
		});
		animation.addEventListener("complete", function onComplete() {
			animation.removeEventListener("complete", onComplete);
			$.bgView.backgroundColor = disabledColor;
			$.swt.left = disabledLeft;
			busy = false;
		});
		$.swt.animate(animation);
	} else {
		$.bgView.backgroundColor = disabledColor;
		$.swt.left = disabledLeft;
		busy = false;
	}
}

function getValue() {
	return currentValue;
}

function setTouchEnabled(_value) {
	$.swt.touchEnabled = _value;
}

function getTouchEnabled() {
	return $.swt.touchEnabled;
}

exports.setValue = setValue;
exports.getValue = getValue;
exports.setTouchEnabled = setTouchEnabled;
exports.getTouchEnabled = getTouchEnabled;
