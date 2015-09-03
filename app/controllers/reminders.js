var args = arguments[0] || {},
    currentView;

function init() {
	$.uihelper.getImage("reminders_refill", $.refillImg);
	$.uihelper.getImage("reminders_med", $.medImg);
	$.uihelper.getImage("reminders_settings", $.settingsImg);
}

function didPostlayout(e) {
	/**
	 * we need height of
	 * $.refillLbl so waiting for postlayout
	 * Note: event listener should be removed
	 * to avoid redundant event calls
	 */
	$.refillLbl.removeEventListener("postlayout", didPostlayout);
	/**
	 * tool tip will be shown
	 * only for the first time
	 */
	if (!$.utilities.getProperty(Alloy.CFG.first_launch_reminders, true, "bool", false)) {
		return false;
	}
	$.utilities.setProperty(Alloy.CFG.first_launch_reminders, false, "bool", false);
	/**
	 * set first tool tip is for
	 * refill
	 */
	currentView = $.refillView;
	$.tooltip.applyProperties({
		top : getPosition(currentView)
	});
	$.tooltip.show();
}

function getPosition(view) {
	var childView = view.children[1],
	    lbl = childView.children[0];
	return view.rect.y + childView.rect.y + lbl.rect.height;
}

function didClickHide(e) {
	$.tooltip.hide(didHide);
}

function didHide() {
	if (currentView != $.settingsView) {
		if (currentView == $.refillView) {
			currentView = $.medView;
			$.tooltipLbl.text = $.strings.remindersTooltipLblMed;
		} else {
			currentView = $.settingsView;
			$.tooltipLbl.text = $.strings.remindersTooltipLblSettings;
		}
		$.tooltip.applyProperties({
			top : getPosition(currentView)
		});
		$.tooltip.show();
	}
}

function didClickRefill(e) {
	$.app.navigator.open({
		titleid : "titleRemindersRefill",
		ctrl : "remindersRefill",
		stack : true
	});
}

function didClickMed(e) {
	$.app.navigator.open({
		titleid : "titleRemindersMed",
		ctrl : "remindersMed",
		stack : true
	});
}

function didClickSettings(e) {
	$.app.navigator.open({
		titleid : "titleRemindersSettings",
		ctrl : "remindersSettings",
		stack : true
	});
}

exports.init = init;
