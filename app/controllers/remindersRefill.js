var args = arguments[0] || {},
    apiCodes = Alloy.CFG.apiCodes,
    isWindowOpen;

function init() {
	$.tableView.top = $.uihelper.getHeightFromChildren($.headerView);
	$.patientSwitcher.set({
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
		}],
		dropdownHandler : patientDropdownHandler
	});
}

function focus() {
	if (!isWindowOpen) {
		isWindowOpen = true;
		getRefillReminder();
	}
}

function getRefillReminder() {
	$.http.request({
		method : "reminders_refill_get",
		params : {
			feature_code : "THXXX",
			data : [{
				reminders : {
					type : apiCodes.reminder_type_refill
				}
			}]
		},
		errorDialogEnabled : false,
		success : didGetRefillReminder,
		failure : didGetRefillReminder
	});
}

function didGetRefillReminder(result, passthrough) {
	/**
	 * if success
	 * or
	 * when no refill reminders
	 * set earlier - first time
	 */
	if (result.data || result.errorCode === apiCodes.no_refill_reminders) {
		//clear existing data
		Alloy.Models.remindersRefill.clear();
		//udpate new data set
		if (result.data) {
			Alloy.Models.remindersRefill.set(result.data.reminders);
		}
	}
}

function patientDropdownHandler(isVisible) {
	var shouldUpdate = updateReminder(function didUpdateReminder() {
		togglePatientDropdown(isVisible);
	});
	if (!shouldUpdate) {
		togglePatientDropdown(isVisible);
	}
}

function togglePatientDropdown(isVisible) {
	$.patientSwitcher[isVisible ? "hide" : "show"]();
}

function didChangePatient(patient) {

}

function updateReminder(callback) {
	return false;
}

function setParentView(view) {
	$.patientSwitcher.setParentView(view);
}

function didClickBenefits(e) {
	$.app.navigator.open({
		titleid : "titleRemindersRefillBenefits",
		ctrl : "remindersRefillBenefits",
		stack : true
	});
}

function backButtonHandler() {
	return updateReminder(handleClose);
}

function handleClose() {
	$.app.navigator.close();
}

function terminate() {
	//terminate patient switcher
	$.patientSwitcher.terminate();
}

exports.init = init;
exports.focus = focus;
exports.terminate = terminate;
exports.setParentView = setParentView;
exports.backButtonHandler = backButtonHandler;
