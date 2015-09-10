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
					type : apiCodes.reminder_type_med
				}
			}]
		},
		keepLoader : true,
		errorDialogEnabled : false,
		success : didGetReminders,
		failure : didGetReminders
	});
}

function didGetReminders(result, passthrough) {
	if (result) {
		/**
		 * check whether it is a success call
		 * since no reminders found is considered as a error and data is null
		 * set reminders node to empty array in order to reset the collection and list
		 */
		if (!result.data) {
			//keep object structure
			result.data = {
				reminders : []
			};
		}
		//update collections
		Alloy.Collections.reminders.reset(result.data.reminders);
		Alloy.Collections.prescriptions.reset([]);
	}
	/**
	 * toggle add view & content header view
	 * if no reminders
	 */
	if (Alloy.Collections.reminders.length) {
		if ($.addView.visible) {
			$.addView.visible = false;
		}
		if (!$.contentHeaderView.visible) {
			$.contentHeaderView.visible = true;
		}
		/**
		 * need to get both hidden and active
		 * prescriptions
		 */
		getPrescriptions(apiCodes.prescription_display_status_active);
	} else {
		//hide loader
		$.app.navigator.hideLoader();
		//reset table
		$.tableView.setData([]);
		//toggle views
		if ($.contentHeaderView.visible) {
			$.contentHeaderView.visible = false;
		}
		if (!$.addView.visible) {
			$.addView.visible = true;
		}
	}
}

function getPrescriptions() {

}

function didGetPrescriptions(result, passthrough) {

}

function getHiddenPrescriptions() {
	//apiCodes.prescription_display_status_hidden
}

function didGetHiddenPrescriptions(result, passthrough) {

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
