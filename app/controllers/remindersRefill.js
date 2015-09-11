var args = arguments[0] || {},
    moment = require("alloy/moment"),
    apiCodes = Alloy.CFG.apiCodes,
    promptClasses = ["content-group-prompt-60"],
    replyClasses = ["content-group-right-inactive-reply-40"],
    replyLinkClasses = ["content-group-right-reply-link-40"],
    dropdownArgs,
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
	var data = [];
	//clear existing data
	Alloy.Models.remindersRefill.clear();
	/**
	 * if success
	 * or
	 * when no refill reminders
	 * set earlier - first time
	 */
	if (result.data || result.errorCode === apiCodes.no_refill_reminders) {
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
		data.push($.remindOnRow.getView());
		$.remindAtRow = Alloy.createController("itemTemplates/promptReply", {
			prompt : $.strings.remindersRefillLblRemindAt,
			reply : moment(currentData.reminder_hour + ":" + currentData.reminder_minute + " " + currentData.reminder_meridiem, "h:m A").format(Alloy.CFG.time_format),
			promptClasses : promptClasses,
			replyClasses : replyClasses,
			hasChild : true
		});
		data.push($.remindAtRow.getView());
		$.remindRepeatRow = Alloy.createController("itemTemplates/promptReply", {
			prompt : $.strings.remindersRefillLblRemindRepeat,
			promptClasses : promptClasses,
			replyClasses : replyClasses,
			hasChild : true
		});
		data.push($.remindRepeatRow.getView());
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
		data.push($.prescriptionsRow.getView());
	}
	$.tableView.setData(data);
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

function showTimePicker() {
	/**
	 * directly used date object
	 * using moment may bring
	 * time zone issues as it
	 * will start calculating
	 * the date with user prefered time zone
	 * not device time zone where as
	 * date picker works with device timezone
	 */
	var date = new Date(),
	    meridiem = currentData.reminder_meridiem,
	    hours = parseInt(currentData.reminder_hour),
	    minutes = parseInt(currentData.reminder_minute);
	if (meridiem == "PM" && hours < 12) {
		hours += 12;
	} else if (meridiem == "AM" && hours == 12) {
		hours -= 12;
	}
	date.setHours(hours);
	date.setMinutes(minutes);
	dropdownArgs.value = date;
	if (OS_ANDROID) {
		var dPicker = Ti.UI.createPicker();
		dPicker.showTimePickerDialog({
			title : dropdownArgs.title,
			okButtonTitle : dropdownArgs.rightTitle,
			value : dropdownArgs.value,
			callback : function(e) {
				var value = e.value;
				if (value) {
					/**
					 * using toLocaleString() of date
					 * for formatting date properly
					 * which helps to avoid time zone
					 * issues
					 * Note: don't process the time zone (ZZ)
					 * with moment. formatLong will have the default
					 * format used in Titanium Android
					 */
					updateRemindAtRow(moment(value.toLocaleString(), dropdownArgs.formatLong).toDate());
				}
			}
		});
	} else if (OS_IOS) {
		$.timePicker = Alloy.createWidget("ti.dropdown", "datePicker", dropdownArgs);
		$.timePicker.on("terminate", didTerminateTimePicker);
		$.timePicker.init();
	}
}

function didTerminateTimePicker(e) {
	if ($.timePicker) {
		$.timePicker.off("terminate", didTerminateTimePicker);
		if (e.value) {
			updateRemindAtRow(e.value);
		}
		$.timePicker = null;
	}
}

function updateRemindAtRow(value) {
	var selectedMoment = moment(value),
	    params = _.clone($.remindAtRow.getParams()),
	    newRow;
	params.reply = selectedMoment.format(Alloy.CFG.time_format);
	//new row
	newRow = Alloy.createController("itemTemplates/promptReply", params);
	//update row
	$.tableView.updateRow( OS_IOS ? 1 : $.remindAtRow.getView(), newRow.getView());
	//update reference
	$.remindAtRow = newRow;
	//extend actual object
	_.extend(currentData, {
		reminder_hour : selectedMoment.format("h"),
		reminder_minute : selectedMoment.format("m"),
		reminder_meridiem : selectedMoment.format("A")
	});
}

function didClickTableView(e) {
	var index = e.index;
	switch(index) {
	case 1:
		showTimePicker();
		break;
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
	dropdownArgs = $.createStyle({
		classes : ["dropdown", "time"]
	});
	dropdownArgs.parent = view;
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
