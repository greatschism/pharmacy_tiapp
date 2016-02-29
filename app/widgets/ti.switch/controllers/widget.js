var args = $.args,
    preventChangeEvt = false;

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
	$.swt.applyProperties(properties);
	//TIMOB-14285
	if (_.has(properties, "id")) {
		$.swt.id = properties.id;
	}
	if (_.has(properties, "analyticsId")) {
		$.swt.analyticsId = properties.analyticsId;
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

_.extend($, {
	getValue : getValue,
	setValue : setValue,
	applyProperties : applyProperties
});
