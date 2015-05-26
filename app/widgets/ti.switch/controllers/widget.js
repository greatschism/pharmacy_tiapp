var args = arguments[0] || {};

(function() {
	if (!_.isEmpty(args)) {
		applyProperties(args, false);
	}
	updateForState(true);
})();

function updateForState(preventAccessbilityFocus) {
	if (OS_ANDROID) {
		var dict = {};
		if (args.onTintColor) {
			dict.color = $.swt.value ? args.onTintColor : args.tintColor;
		}
		if (args.imageOn) {
			dict.backgroundImage = $.swt.value ? args.imageOn : args.imageOff;
		}
		if (args.onAccessibilityLabel) {
			dict.accessibilityLabel = $.swt.value ? args.onAccessibilityLabel : args.offAccessibilityLabel;
		}
		$.swt.applyProperties(dict);
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
