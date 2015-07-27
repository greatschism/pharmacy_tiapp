var args = arguments[0] || {};

(function() {
	if (!_.isEmpty(args)) {
		applyProperties(args, false);
	}
	updateForState(true);
})();

function updateForState(preventAccessbilityFocus) {
	if (OS_ANDROID) {
		var value = $.swt.value;
		if (args.style == Ti.UI.Android.SWITCH_STYLE_TOGGLEBUTTON) {
			var dict = {};
			if (args.tintColorOn) {
				dict.color = value ? args.tintColorOn : args.tintColorOff;
			}
			if (args.imageOn) {
				dict.backgroundImage = value ? args.imageOn : args.imageOff;
			}
			if (args.accessibilityLabelOn) {
				dict.accessibilityLabel = value ? args.accessibilityLabelOn : args.accessibilityLabelOff;
			}
			$.swt.applyProperties(dict);
		} else if (args.accessibilityLabelOn) {
			$.swt.accessibilityLabel = value ? args.accessibilityLabelOn : args.accessibilityLabelOff;
		}
		if (Ti.App.accessibilityEnabled && preventAccessbilityFocus !== true && args.triggerAccessbilityFocus !== false) {
			Ti.App.fireSystemEvent(Ti.App.Android.EVENT_ACCESSIBILITY_FOCUS_CHANGED, $.swt);
		}
	}
}

function setValue(value) {
	$.swt.value = value;
	updateForState();
}

function getValue() {
	return $.swt.value;
}

function applyProperties(properties, extend) {
	$.swt.applyProperties(properties);
	if (extend !== false) {
		_.extend(args, properties);
		updateForState();
	}
}

function didChange(e) {
	updateForState();
	$.trigger("change", {
		value : e.value,
		source : $
	});
}

exports.setValue = setValue;
exports.getValue = getValue;
exports.applyProperties = applyProperties;
