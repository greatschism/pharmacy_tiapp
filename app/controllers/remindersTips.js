var args = arguments[0] || {},
    currentView;

function init() {
	$.uihelper.getImage("reminders_tips_refill", $.refillImg);
	$.uihelper.getImage("reminders_tips_med", $.medImg);
	$.uihelper.getImage("reminders_tips_settings", $.settingsImg);
}

function getPosition(view) {
	var childView = view.children[1],
	    lbl = childView.children[0];
	return view.rect.y + childView.rect.y + lbl.rect.height;
}

function didPostlayout(e) {
	currentView = $.refillView;
	$.tooltip.applyProperties({
		top : getPosition(currentView)
	});
	$.tooltip.show();
}

function didClickHide(e) {
	$.tooltip.hide(didHide);
}

function didHide() {
	if (currentView != $.settingsView) {
		if (currentView == $.refillView) {
			currentView = $.medView;
			$.tooltipLbl.text = $.strings.remindersTipsTooltipLblMed;
		} else {
			currentView = $.settingsView;
			$.tooltipLbl.text = $.strings.remindersTipsTooltipLblSettings;
		}
		$.tooltip.applyProperties({
			top : getPosition(currentView)
		});
		$.tooltip.show();
	}
}

exports.init = init;
