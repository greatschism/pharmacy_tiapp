var args = $.args,
    authenticator = require("authenticator"),
    apiCodes = Alloy.CFG.apiCodes,
    isEmailSent = false,
    promptClasses = ["left", "width-60"],
    replyClasses = ["right", "width-40", "txt-right", "inactive-fg-color"],
    rows = [],
    options;

function init() {
	//tableview form top
	$.tableView.top = $.uihelper.getHeightFromChildren($.headerView);
	//get options array ready
	options = [{
		title : $.strings.strDeliveryModePush,
		value : authenticator.getPushModeForDeviceToken(),
		selected : false
	}, {
		title : $.strings.strDeliveryModeEmail,
		value : apiCodes.reminder_delivery_mode_email,
		selected : false
	}, {
		title : $.strings.strDeliveryModeText,
		value : apiCodes.reminder_delivery_mode_text,
		selected : false
	}, {
		title : $.strings.strDeliveryModeNone,
		value : apiCodes.reminder_delivery_mode_none,
		selected : false
	}];
	/**
	 * set patient switcher
	 * dropdownHandler should be used here
	 * rather than using a callback (upon selection)
	 * which may be affect by a invite dialog
	 */
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
		}],
		dropdownHandler : patientDropdownHandler
	});
	//Reminders section - dynamic & configurable
	$.deliveryModesSection = $.uihelper.createTableViewSection($, $.strings.remindersSettingsSectionMode);
	_.each(Alloy.CFG.reminders, function(reminder) {
		if (reminder.enabled) {
			var reminderDeliveryMode = patient.get(reminder.col_pref),
			    row = Alloy.createController("itemTemplates/promptReply", {
				reminderId : reminder.id,
				reminderDeliveryMode : reminderDeliveryMode,
				prefColumn : reminder.col_pref,
				prompt : $.strings["remindersSettingsLblType" + $.utilities.ucfirst(reminder.id, true)],
				reply : _.findWhere(options, {
					value : reminderDeliveryMode
				}).title,
				promptClasses : promptClasses,
				replyClasses : replyClasses,
				hasChild : true
			});
			$.deliveryModesSection.add(row.getView());
			rows.push(row);
		}
	});
	//Rx section - static
	$.rxSection = $.uihelper.createTableViewSection($, $.strings.remindersSettingsSectionRx);
	var showRxRow = Alloy.createController("itemTemplates/labelWithSwitch", {
		prefColumn : "show_rx_names_flag",
		title : $.strings.remindersSettingsLblShowRx,
		value : parseInt(patient.get("show_rx_names_flag")) || 0 ? true : false
	});
	showRxRow.on("change", didChangeShowRxNames);
	$.rxSection.add(showRxRow.getView());
	rows.push(showRxRow);
	//set data
	$.tableView.setData([$.deliveryModesSection, $.rxSection]);
}

function didChangeShowRxNames(e) {
	if (Alloy.CFG.show_rx_names_dialog_enabled && e.value) {
		$.uihelper.showDialog({
			message : String.format($.strings.remindersSettingsMsgShowRxNames, $.strings.strClientName)
		});
	}
}

function patientDropdownHandler(isVisible) {
	var shouldUpdate = updatePreferences(function didUpdatePreferences() {
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
	_.each(rows, function(row, index) {
		var params = row.getParams(),
		    value = $.patientSwitcher.get().get(params.prefColumn);
		/**
		 * if has reminderDeliveryMode property
		 * then it is delivery method section,
		 * otherwise should be show rx names
		 */
		if (_.has(params, "reminderDeliveryMode")) {
			//update params
			_.extend(params, {
				reminderDeliveryMode : value,
				reply : _.findWhere(options, {
					value : value
				}).title
			});
			/**
			 * create new row
			 */
			rows[index] = Alloy.createController("itemTemplates/promptReply", params);
		} else {
			/**
			 * better to remove listenr for existing row
			 */
			row.off("change", didChangeShowRxNames);
			//update params
			params.value = parseInt(value) || 0 ? true : false;
			/**
			 * create new row
			 * just updating switch with
			 * setValue method may not be good idea here
			 * as it is listening for change event and throws
			 * dialog when true
			 */
			rows[index] = Alloy.createController("itemTemplates/labelWithSwitch", params);
			rows[index].on("change", didChangeShowRxNames);
		}
		//update row
		$.tableView.updateRow( OS_IOS ? index : row.getView(), rows[index].getView());
	});
}

function didClickTableView(e) {
	/**
	 * if a row within
	 * deliveryModesSection
	 * then show picker
	 */
	var index = e.index;
	if (index < $.deliveryModesSection.rowCount) {
		var params = rows[index].getParams();
		/**
		 * let keep reference of this index
		 * deliveryModesPicker - is a controller (widget)
		 */
		$.deliveryModesPicker.currentIndex = index;
		/**
		 * prepare option items
		 */
		_.each(options, function(option) {
			option.selected = option.value === params.reminderDeliveryMode;
		});
		//set items and show
		$.deliveryModesPicker.setItems(options);
		$.deliveryModesPicker.show();
	}
}

function didClickDeliveryMode(e) {
	//get current value
	var index = $.deliveryModesPicker.currentIndex,
	    row = rows[index],
	    params = row.getParams(),
	    oldReminderDeliveryMode = params.reminderDeliveryMode,
	    oldReply = params.reply,
	    data = e.data;
	/**
	 * update new values
	 * from copy of existing row
	 * params
	 */
	_.extend(params, {
		reminderDeliveryMode : data.value,
		reply : data.title
	});
	//create new row and update
	rows[index] = Alloy.createController("itemTemplates/promptReply", params);
	$.tableView.updateRow( OS_IOS ? index : row.getView(), rows[index].getView());
	//delete index
	delete $.deliveryModesPicker.currentIndex;
	/**
	 * check whether delivery mode
	 * is verified
	 */
	var mPatient = $.patientSwitcher.get();
	switch(data.value) {
	/**
	 * reminder_delivery_mode_push
	 * device push settings are validated as
	 * part of update preferences
	 */
	case apiCodes.reminder_delivery_mode_email:
		if (!isEmailSent && mPatient.get("is_email_verified") !== "1") {
			$.http.request({
				method : "email_resend",
				errorDialogEnabled : false,
				success : didEmailResend,
				failure : didNotEmailResend
			});
		}
		break;
	case apiCodes.reminder_delivery_mode_text:
		/**
		 * check whether phone number
		 * is invalid or not verified
		 */
		if (mPatient.get("mobile_number") === "null" || mPatient.get("is_mobile_verified") !== "1") {
			$.uihelper.showDialog({
				message : $.strings.remindersSettingsMsgPhoneNotVerified,
				buttonNames : [$.strings.remindersSettingsDialogBtnPhoneNotVerified, $.strings.dialogBtnCancel],
				cancelIndex : 1,
				success : function didConfirm() {
					var navigation;
					if (mPatient.get("mobile_number") != "null") {
						navigation = {
							titleid : "titleChangePhone",
							ctrl : "phone",
							stack : true
						};
					} else {
						navigation = {
							ctrl : "textBenefits",
							titleid : "titleTextBenefits",
							stack : true
						};
					}
					$.app.navigator.open(navigation);
				},
				cancel : function didCancel() {
					_.extend(params, {
						reminderDeliveryMode : oldReminderDeliveryMode,
						reply : oldReply
					});
					rows[index] = Alloy.createController("itemTemplates/promptReply", params);
					$.tableView.updateRow( OS_IOS ? index : row.getView(), rows[index].getView());
				}
			});
		}
		break;
	}
}

function didEmailResend(result, passthrough) {
	isEmailSent = true;
	$.uihelper.showDialog({
		message : $.strings.remindersSettingsMsgEmailNotVerified
	});
}

function didNotEmailResend(error, passthrough) {
	var code = error.code;
	if (code !== Alloy.CFG.apiCodes.email_verified) {
		/**
		 * email was verified already
		 * update local data now
		 */
		$.patientSwitcher.get().set("is_email_verified", "1");
	} else {
		$.uihelper.showDialog({
			message : $.http.getNetworkErrorByCode(code)
		});
	}
}

function didClickClose(e) {
	$.deliveryModesPicker.hide();
}

function setParentView(view) {
	$.patientSwitcher.setParentView(view);
}

function updatePreferences(callback) {
	var prefObj = {};
	_.each(rows, function(row) {
		var params = row.getParams();
		/**
		 * if has reminderDeliveryMode property
		 * then it is delivery method section,
		 * otherwise should be show rx names
		 */
		prefObj[params.prefColumn] = _.has(params, "reminderDeliveryMode") ? params.reminderDeliveryMode : (row.getValue() ? "1" : "0");
	});
	/**
	 * update with api only if preferences update is found
	 * otherwise just return false
	 */
	if (!$.utilities.isMatch($.patientSwitcher.get().toJSON(), prefObj)) {
		authenticator.updatePreferences(prefObj, {
			success : callback
		});
		return true;
	}
	return false;
}

function backButtonHandler() {
	if ($.deliveryModesPicker && $.deliveryModesPicker.getVisible()) {
		return $.deliveryModesPicker.hide();
	}
	return updatePreferences(handleClose);
}

function handleClose() {
	$.app.navigator.close();
}

function terminate() {
	//terminate patient switcher
	$.patientSwitcher.terminate();
}

exports.init = init;
exports.terminate = terminate;
exports.setParentView = setParentView;
exports.backButtonHandler = backButtonHandler;
