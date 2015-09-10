var args = arguments[0] || {},
    apiCodes = Alloy.CFG.apiCodes,
    promptClasses = ["content-group-prompt-60"],
    replyClasses = ["content-group-right-inactive-reply-40"],
    isWindowOpen;

function init() {
	$.tableView.top = $.uihelper.getHeightFromChildren($.headerView);
	$.patientSwitcher.set({
		title : $.strings.remindersRefillPatientSwitcher,
		where : {
			is_partial : false
		},
		selectable : {
			is_partial : false
		},
		subtitles : [{
			where : {
				is_partial : false
			},
			subtitle : $.strings.remindersRefillPatientSwitcherSubtitlePartial
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
		keepLoader : true,
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
			prepareTable();
		} else {
			setDefaults();
		}
	}
}

function prepareTable() {
	$.remindOnRow = Alloy.createController("itemTemplates/promptReply", {
		prompt : $.strings.remindersRefillLblRemindOn,
		promptClasses : promptClasses,
		replyClasses : replyClasses,
		hasChild : true
	});
	$.remindAtRow = Alloy.createController("itemTemplates/promptReply", {
		prompt : $.strings.remindersRefillLblRemindAt,
		promptClasses : promptClasses,
		replyClasses : replyClasses,
		hasChild : true
	});
	$.remindRepeatRow = Alloy.createController("itemTemplates/promptReply", {
		prompt : $.strings.remindersRefillLblRemindRepeat,
		promptClasses : promptClasses,
		replyClasses : replyClasses,
		hasChild : true
	});
	$.prescriptionsRow = Alloy.createController("itemTemplates/promptReply", {
		prompt : $.strings.remindersRefillLblPrescriptions,
		promptClasses : promptClasses,
		replyClasses : replyClasses,
		hasChild : true
	});
	$.tableView.setData([$.remindOnRow.getView(), $.remindAtRow.getView(), $.remindRepeatRow.getView(), $.prescriptionsRow.getView()]);
	$.app.navigator.hideLoader();
}

function setDefaults() {
	getPrescriptions(apiCodes.prescription_display_status_active, function didGetPrescriptions(activeResult, activePassthrough) {
		var prescriptions = [];
		if (activeResult.data) {
			_.each(activeResult.data.prescriptions, function(prescription) {
				prescriptions.push(_.pick(prescription, ["id"]));
			});
		}
		getPrescriptions(apiCodes.prescription_display_status_hidden, function didGetHiddenPrescriptions(hiddenResult, hiddenPassthrough) {
			if (hiddenResult.data) {
				_.each(hiddenResult.data.prescriptions, function(prescription) {
					prescriptions.push(_.pick(prescription, ["id"]));
				});
			}
			Alloy.Models.remindersRefill.set({
				remind_before_in_days : 3,
				reminder_hour : 9,
				reminder_minute : 0,
				reminder_meridiem : "AM",
				no_of_reminders : 0,
				prescriptions : prescriptions
			});
			prepareTable();
		});
	});
}

function getPrescriptions(status, callback) {
	$.http.request({
		method : "prescriptions_list",
		params : {
			feature_code : "THXXX",
			data : [{
				prescriptions : {
					sort_order_preferences : Alloy.Collections.patients.at(0).get("pref_prescription_sort_order"),
					prescription_display_status : status
				}
			}]
		},
		keepLoader : true,
		errorDialogEnabled : false,
		success : callback,
		failure : callback
	});
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
