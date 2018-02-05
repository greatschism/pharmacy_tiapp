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
		 if(value){
			$.swt.color = "#38E780";
			$.swt.text = Alloy.CFG.icons.switch_on;
		} else {
			$.swt.color = "#A7A7A7";
			$.swt.text = Alloy.CFG.icons.switch_off;
		}
		if (args.accessibilityLabel) {
			$.swt.accessibilityLabel = args.accessibilityLabel;
		}
		if (args.accessibilityHint) {
			$.swt.accessibilityHint = args.accessibilityHint;
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


function didClick(e){
	if (preventChangeEvt) {
		preventChangeEvt = false;
		return;
	}
	$.swt.value = !e.source.value;
	$.trigger("change", {
		value : (OS_ANDROID) ? e.source.value : e.value,
		source : $
	});
	updateForState();
}

_.extend($, {
	getValue : getValue,
	setValue : setValue,
	applyProperties : applyProperties
});
