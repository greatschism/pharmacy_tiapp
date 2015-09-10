var args = arguments[0] || {},
    apiCodes = Alloy.CFG.apiCodes,
    promptClasses = ["content-group-prompt-60"],
    replyClasses = ["content-group-right-inactive-reply-40"],
    replyLinkClasses = ["content-group-right-reply-link-40"],
    currentData,
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
				is_partial : true
			},
			subtitle : $.strings.remindersRefillPatientSwitcherSubtitlePartial
		}],
		dropdownHandler : patientDropdownHandler
	});
}

function focus() {
	if (!isWindowOpen) {
		isWindowOpen = true;
		getAllPrescriptions();
	}
}

function getAllPrescriptions() {
	//clear existing prescriptions
	Alloy.Collections.prescriptions.reset([]);
	//process prescriptions
	getPrescriptions(apiCodes.prescription_display_status_active, didGetPrescriptions);
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

function didGetPrescriptions(result, passthrough) {
	if (result.data) {
		Alloy.Collections.prescriptions.add(result.data.prescriptions);
	}
	getPrescriptions(apiCodes.prescription_display_status_hidden, didGetHiddenPrescriptions);
}

function didGetHiddenPrescriptions(result, passthrough) {
	if (result.data) {
		Alloy.Collections.prescriptions.add(result.data.prescriptions);
	}
	//just sort it alphabetically as in prescriptions list
	Alloy.Collections.prescriptions.reset(Alloy.Collections.prescriptions.sortBy(function(model) {
		return model.get("presc_name").toLowerCase();
	}));
	getRefillReminder();
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
			currentData = result.data.reminders;
			Alloy.Models.remindersRefill.set(data);
		} else {
			/**
			 * defaults
			 * don't update model
			 * until api is called
			 */
			var prescriptions = [];
			Alloy.Collections.prescriptions.each(function(prescription) {
				prescriptions.push(_.pick(prescription, ["id"]));
			});
			currentData = {
				remind_before_in_days : 3,
				reminder_hour : 9,
				reminder_minute : 0,
				reminder_meridiem : "AM",
				no_of_reminders : 0,
				prescriptions : prescriptions
			};
		}
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
		var remindPrescLen = currentData.prescriptions.length,
		    lKey = "remindersRefillLblManagePrescriptions";
		if (remindPrescLen === 0) {
			lKey += "None";
		} else if (remindPrescLen === Alloy.Collections.prescriptions.length) {
			lKey += "All";
		}
		$.prescriptionsRow = Alloy.createController("itemTemplates/promptReply", {
			prompt : $.strings.remindersRefillLblPrescriptions,
			reply : $.strings[lKey],
			promptClasses : promptClasses,
			replyClasses : replyLinkClasses,
			hasChild : true
		});
		$.tableView.setData([$.remindOnRow.getView(), $.remindAtRow.getView(), $.remindRepeatRow.getView(), $.prescriptionsRow.getView()]);
	}
	$.app.navigator.hideLoader();
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

function didClickTableView(e) {
	var index = e.index;
	switch(index) {
	case 3:
		//prescriptions
		$.app.navigator.open({
			titleid : "titlePrescriptionsAdd",
			ctrl : "prescriptions",
			ctrlArguments : {
				patientSwitcherDisabled : true,
				showHiddenPrescriptions : true,
				preventRefillValidation : true,
				useCache : true,
				selectable : true,
				selectedItems : _.pluck(currentData.prescriptions, "id"),
				prescriptions : currentData.prescriptions
			},
			stack : true
		});
		break;
	}
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
