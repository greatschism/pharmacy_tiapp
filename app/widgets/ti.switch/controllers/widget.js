var args = arguments[0] || {};

(function() {
	if (!_.isEmpty(args)) {
		applyProperties(args, false);
	}
	updateForState(true);
})();

function updateForState(_preventAccessbilityFocus) {
	if (OS_ANDROID) {
		if (args.onImage) {
			$.swt.backgroundImage = $.swt.value ? args.onImage : args.offImage;
		}
		if (args.onAccessibilityLabel) {
			$.swt.accessibilityLabel = $.swt.value ? args.onAccessibilityLabel : args.offAccessibilityLabel;
		}
		if (Ti.App.accessibilityEnabled && _preventAccessbilityFocus !== true && args.triggerAccessbilityFocus !== false) {
			Ti.App.fireSystemEvent(Ti.App.Android.EVENT_ACCESSIBILITY_FOCUS_CHANGED, $.swt);
		}
	}
}

function setValue(_value) {
	$.swt.value = _value;
	updateForState();
}

function getValue() {
	return $.swt.value;
}

function applyProperties(_properties, _extend) {
	$.swt.applyProperties(_properties);
	if (_extend !== false) {
		_.extend(args, _properties);
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
