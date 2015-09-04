var args = arguments[0] || {},
    apiCodes = Alloy.CFG.apiCodes,
    isWindowOpen;

function init() {
	$.patientSwitcher.set({
		title : $.strings.remindersMedPatientSwitcher,
		where : {
			is_partial : false
		},
		selectable : {
			is_partial : false
		},
		subtitles : [{
			where : {
				is_partial : true
			},
			subtitle : $.strings.remindersMedPatientSwitcherSubtitlePartial
		}]
	});
	var top = $.uihelper.getHeightFromChildren($.headerView);
	$.tableView.top = top;
	$.addView.top = top;
}

function focus() {
	/*
	 * avoid null pointer if another controller or another instance of this controller
	 * used this global variable in it's life span
	 */
	Alloy.Globals.currentTable = $.tableView;
	if (!isWindowOpen) {
		isWindowOpen = true;
		getMedReminders();
	}
}

function getMedReminders() {
	$.http.request({
		method : "reminders_med_list",
		params : {
			feature_code : "THXXX",
			data : [{
				reminders : {
					type : apiCodes.reminder_type_dosage
				}
			}]
		},
		keepLoader : true,
		success : didGetReminders
	});
}

function didGetReminders(result, passthrough) {
	console.log(result);
}

function getPrescriptions(status) {

}

function didGetPrescriptions(result, passthrough) {

}

function getHiddenPrescriptions(status) {

}

function didGetHiddenPrescriptions(result, passthrough) {

}

function didChangePatient(e) {

}

function didClickTableView(e) {

}

function didClickAdd(e) {

}

function setParentView(view) {
	$.patientSwitcher.setParentView(view);
}

function terminate() {
	//terminate patient switcher
	$.patientSwitcher.terminate();
	/**
	 * not resetting currentTable object
	 * as there are chance when nullify it here
	 * may affect the object being set on next
	 * controllers init / focus method
	 */
	Alloy.Globals.currentRow = null;
	Alloy.Globals.isSwipeInProgress = false;
}

exports.init = init;
exports.focus = focus;
exports.terminate = terminate;
exports.setParentView = setParentView;
