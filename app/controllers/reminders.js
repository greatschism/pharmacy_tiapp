var args = $.args,
    currentView;

function init(e) {
	_.each(["refillView", "medView", "settingsView"], function(val) {
		$.uihelper.wrapViews($[val]);
	});
	
	$.refillView.accessibilityLabel = $.refillTitleLbl.text + " " + $.refillDescLbl.text;
	$.medView.accessibilityLabel = $.medTitleLbl.text + " " + $.medDescLbl.text;
	$.settingsView.accessibilityLabel = $.settingsTitleLbl.text + " " + $.settingsDescLbl.text;
}

function didPostlayout(e) {
	/**
	 * we need height of
	 * $.refillView and it's content
	 * so waiting for postlayout
	 * Note: event listener should be removed
	 * to avoid redundant event calls
	 */
	e.source.removeEventListener("postlayout", didPostlayout);
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
	$.tooltip = Alloy.createWidget("ti.tooltip", "widget", $.createStyle({
		classes : ["margin-right", "width-50", "direction-up", "bg-color", "primary-border", "show"],
		arrowDict : $.createStyle({
			classes : ["bg-color", "i5", "primary-fg-color", "icon-tooltip-arrow-up"]
		}),
		arrowPadding : 6.5,
		top : getPosition(currentView)
	}));
	$.contentView = $.UI.create("View", {
		classes : ["auto-height", "vgroup"]
	});
	$.tooltipLbl = $.UI.create("Label", {
		apiName : "Label",
		classes : ["margin-top", "margin-left", "margin-right"],
		text : $.strings.remindersTooltipLblRefill
	});
	$.contentView.add($.tooltipLbl);
	$.tooltipHideBtn = $.UI.create("Button", {
		apiName : "Button",
		classes : ["margin-top-medium", "margin-bottom", "margin-left-extra-large", "margin-right-extra-large", "min-height", "primary-bg-color", "h5", "primary-font-color", "primary-border"],
		title : $.strings.remindersTooltipBtnHide
	});
	$.tooltipHideBtn.addEventListener("click", didClickHide);
	$.contentView.add($.tooltipHideBtn);
	$.tooltip.setContentView($.contentView);
	if (!Ti.App.accessibilityEnabled) {		
		$.scrollView.add($.tooltip.getView());
	};
}

function getPosition(view) {
	return view.rect.y;
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
