var args = arguments[0] || {},
    preventChangeEvt = false;

(function() {
	$.swt = Ti.UI.createSwitch({
		width : 56,
		height : 36,
		id : args.id || "switch"
	});
	$.swt.addEventListener("change", didChange);
	$.widget.add($.swt);
	applyProperties(args);
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

/**
 * @param {Boolean} value
 * @param {Boolean} prevent
 * Once view is loaded, change events will be triggered
 * even if the value is changed programmatically. In
 * such cases set prevent to true.
 * Note: if the native viewDidLoad / activity start
 * is not fired yet then switch will not
 * trigger a change event
 */
function setValue(value, prevent) {
	preventChangeEvt = prevent;
	$.swt.value = value;
	updateForState();
}

function getValue() {
	return $.swt.value;
}

function applyProperties(properties, extend) {
	var options = _.pick(properties, ["top", "bottom", "left", "right"]);
	if (!_.isEmpty(options)) {
		$.widget.applyProperties(options);
	}
	options = _.omit(properties, ["top", "bottom", "left", "right"]);
	if (!_.isEmpty(options)) {
		$.swt.applyProperties(options);
	}
	if (extend !== false) {
		_.extend(args, properties);
		updateForState();
	}
}

function didChange(e) {
	if (preventChangeEvt) {
		preventChangeEvt = false;
		return;
	}
	updateForState();
	$.trigger("change", {
		value : e.value,
		source : $
	});
}

exports.setValue = setValue;
exports.getValue = getValue;
exports.applyProperties = applyProperties;
