var args = arguments[0] || {},
    authenticator = require("authenticator"),
    apiCodes = Alloy.CFG.apiCodes,
    promptClasses = ["content-group-prompt-60"],
    replyClasses = ["content-group-right-inactive-reply-40"],
    options,
    rows = [];

function init() {
	//get options array ready
	options = [{
		title : $.strings.strDeliveryModePush,
		value : apiCodes.reminder_delivery_mode_push,
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
	//set patient switcher
	var patient = setPatient();
	//Reminders section - dynamic & configurable
	$.deliveryModesSection = $.uihelper.createTableViewSection($, $.strings.remindersSettingsSectionMode);
	_.each(Alloy.CFG.reminders, function(reminder) {
		if (reminder.enabled) {
			var reminderDeliveryMode = patient.get(reminder.col_pref),
			    row = Alloy.createController("itemTemplates/promptReply", {
				reminderId : reminder.id,
				prefColumn : reminder.col_pref,
				reminderDeliveryMode : reminderDeliveryMode,
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
	$.tableView.applyProperties({
		top : $.uihelper.getHeightFromChildren($.headerView),
		data : [$.deliveryModesSection, $.rxSection]
	});
}

function setPatient(where) {
	return $.patientSwitcher.set({
		title : $.strings.remindersSettingsPatientSwitcher,
		where : where || {
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
		callback : didChoosePatient
	});
}

function didChangeShowRxNames(e) {
	if (Alloy.CFG.show_rx_names_dialog_enabled && e.value) {
		$.uihelper.showDialog({
			message : $.strings.remindersSettingsMsgShowRxNames
		});
	}
}

function didChoosePatient(patient) {
	/**
	 * returns true / false
	 * when true - the current patient preferences should be updated,
	 * then call set in didUpdatePreferences which is called upon successful
	 * api call
	 * when false - no changes made for current patient, just move to the next patient
	 * Note: bitwise value of updatePreferences is sent to patientSwitcher.
	 * true will make patient switcher to go head and switch and false
	 * will prevent the same
	 */
	return !(updatePreferences(function didUpdatePreferences() {
			didChangePatient(setPatient(_.pick(patient, ["child_id"])).toJSON());
		}));
}

function didChangePatient(patient) {
	_.each(rows, function(row, index) {
		var params = row.getParams();
		/**
		 * if has reminderDeliveryMode property
		 * then it is delivery method section,
		 * otherwise should be show rx names
		 */
		if (_.has(params, "reminderDeliveryMode")) {
			var newParams = _.clone(params),
			    reminderDeliveryMode = patient[params.col_pref];
			_.extend(newParams, {
				reminderDeliveryMode : reminderDeliveryMode,
				reply : _.findWhere(options, {
					value : reminderDeliveryMode
				}).title
			});
			//create new row and update
			rows[index] = Alloy.createController("itemTemplates/promptReply", newParams);
			$.tableView.updateRow( OS_IOS ? index : row.getView(), rows[index].getView());
		} else {
			row.setValue(parseInt(patient[params.col_pref]) || 0 ? true : false);
		}
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
	    params = _.clone(row.getParams()),
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
		prefObj[params.prefColumn] = _.has(params, "reminderDeliveryMode") ? params.reminderDeliveryMode : parseInt(row.getValue());
	});
	/**
	 * update with api only if preferences update is found
	 * otherwise just return false
	 */
	if (!$.utilities.isMatch($.patientSwitcher.get().toJSON(), prefObj)) {
		authenticator.updatePreferences(prefObj, callback);
		return true;
	}
	return false;
}

function backButtonHandler() {
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
