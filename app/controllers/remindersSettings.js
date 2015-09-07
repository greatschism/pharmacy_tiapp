var args = arguments[0] || {},
    promptClasses = ["content-group-prompt-60"],
    replyClasses = ["content-group-right-reply-40"],
    rows = [];

function init() {
	var patient = $.patientSwitcher.set({
		title : $.strings.remindersSettingsPatientSwitcher,
		where : {
			is_adult : true,
			is_partial : false
		},
		selectable : {
			is_adult : true
		},
		subtitles : [{
			where : {
				is_adult : false
			},
			subtitle : $.strings.remindersSettingsPatientSwitcherSubtitleMinor
		}]
	}),
	    row;
	//Rx section - static
	$.rxSection = $.uihelper.createTableViewSection($, $.strings.remindersSettingsSectionRx);
	row = Alloy.createController("itemTemplates/labelWithSwitch", {
		title : $.strings.remindersSettingsLblShowRx
	});
	$.rxSection.add(row.getView());
	rows.push(row);
	//Reminders section - dynamic & configurable
	$.modeSection = $.uihelper.createTableViewSection($, $.strings.remindersSettingsSectionMode);
	_.each(Alloy.CFG.reminders, function(reminder) {
		if (reminder.enabled) {
			row = Alloy.createController("itemTemplates/promptReply", {
				prompt : $.strings["remindersSettingsLblType".concat($.utilities.ucfirst(reminder.id))],
				promptClasses : promptClasses,
				replyClasses : replyClasses,
				hasChild : true
			});
			$.modeSection.add(row.getView());
			rows.push(row);
		}
	});
	$.tableView.applyProperties({
		top : $.uihelper.getHeightFromChildren($.headerView),
		data : [$.modeSection, $.rxSection]
	});
}

function didChangePatient(e) {

}

function setParentView(view) {
	$.patientSwitcher.setParentView(view);
}

function terminate() {
	//terminate patient switcher
	$.patientSwitcher.terminate();
}

exports.init = init;
exports.terminate = terminate;
exports.setParentView = setParentView;
