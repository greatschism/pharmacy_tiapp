var args = arguments[0] || {},
    moment = require("alloy/moment"),
    apiCodes = Alloy.CFG.apiCodes,
    rows = [],
    reminder = args.reminder,
    prescriptions = args.isUpdate ? reminder.prescriptions : args.prescriptions,
    selectedPrescriptions = [],
    frequencyOptions = [],
    promptClasses = ["content-group-prompt-60"],
    replyClasses = ["content-group-right-inactive-reply-40"],
    nonRemovableDict = {
	masterWidth : 100,
	detailWidth : 0,
	btnClasses : false
},
    removableDict = {
	masterWidth : 70,
	detailWidth : 30,
	btnClasses : ["content-detail-negative-icon", "icon-unfilled-remove"]
},
    selectedColor;

function init() {
	//reminder section
	$.reminderSection = Ti.UI.createTableViewSection();
	//color box row
	var colorRow = getColorBoxRow(reminder.color_code || Alloy.CFG.default_color);
	$.reminderSection.add(colorRow.getView());
	rows.push(colorRow);
	//remind frequency
	var frequencyId = reminder.frequency || Alloy.CFG.reminder_med_default_frequency,
	    frequencyRow = getFrequencyRow(frequencyId);
	$.reminderSection.add(frequencyRow.getView());
	rows.push(frequencyRow);
	//options for this frequency
	_.each(getOptionRows(frequencyId, reminder), function(row) {
		$.reminderSection.add(row.getView());
		rows.push(row);
	});
	//prescriptions section
	var iconDict;
	/*
	 * only allow add prescriptions
	 * if canAdd flag is not false
	 */
	if (args.canAdd !== false) {
		iconDict = $.createStyle({
			classes : ["content-header-right-icon", "icon-add"]
		});
		_.extend(iconDict, {
			isIcon : true,
			callback : didClickAddPresc
		});
	}
	$.prescSection = $.uihelper.createTableViewSection($, $.strings.remindersMedSettingsSectionPresc, null, false, false, iconDict);
	//if more than one prescription is there add right icon to remove a prescription
	var isRemovable = prescriptions.length > 1;
	_.each(prescriptions, function(prescription) {
		/**
		 * if this is a update
		 * then prescriptions won't
		 * have any more information
		 * than it's id, so get it
		 * from collection
		 */
		if (!_.has(prescription, "title")) {
			prescription = Alloy.Collections.prescriptions.findWhere({
				id : prescription.id
			}).toJSON();
		}
		_.extend(prescription, isRemovable ? removableDict : nonRemovableDict);
		var row = getPrescRow(prescription);
		$.prescSection.add(row.getView());
		rows.push(row);
	});
	//set data
	$.tableView.setData([$.reminderSection, $.prescSection]);
	//update frequency picker
	_.each(Alloy.CFG.reminder_med_frequencies, function(option) {
		option = _.clone(option);
		_.extend(option, {
			title : $.strings["remindersMedSettingsLblFrequency" + option.id],
			selected : option.id === frequencyId
		});
		frequencyOptions.push(option);
	});
	$.frequencyPicker.setItems(frequencyOptions);
}

function getColorBoxRow(color) {
	return Alloy.createController("itemTemplates/labelWithColorBox", {
		title : $.strings.remindersMedSettingsLblReminderColor,
		color : color
	});
}

function getFrequencyRow(frequencyId) {
	return Alloy.createController("itemTemplates/promptReply", {
		frequencyId : frequencyId,
		prompt : $.strings.remindersMedSettingsLblRemindFrequency,
		reply : $.strings["remindersMedSettingsLblFrequency" + frequencyId],
		promptClasses : promptClasses,
		replyClasses : replyClasses,
		hasChild : true
	});
}

function getOptionRows(frequencyId, data) {
	var optionRows = [],
	    frequencyObj = _.findWhere(frequencyOptions, {
		id : frequencyId
	}),
	    startHours = data.reminder_start_hour || [{
		hour : moment().hours(),
		minutes : "00"
	}];
	/**
	 * number of times if enabled
	 * for this frequency
	 */
	if (frequencyObj.number_of_times_enabled) {
		var numberOfTimes = parseInt(data.number_of_times) || 1;
		optionRows.push(Alloy.createController("itemTemplates/promptReply", {
			frequencyId : frequencyId,
			pickerType : "number_of_times",
			value : numberOfTimes,
			prompt : $.strings.remindersMedSettingsLblRemindTimes,
			reply : numberOfTimes + " " + $.strings[numberOfTimes > 1 ? "strTimes" : "strTime"],
			promptClasses : promptClasses,
			replyClasses : replyClasses,
			hasChild : true
		}));
	}
	switch(frequencyId) {
	case apiCodes.reminder_frequency_daily:
		break;
	case apiCodes.reminder_frequency_weekly:
		break;
	case apiCodes.reminder_frequency_monthly:
		var monthdayInputFormat = "DD",
		    monthdayOutputFormat = "Do",
		    monthdays = data.day_of_month || [{
			monthday : moment().date()
		}],
		    mCount = monthdays.length - 1,
		    mLastBefore = mCount - 1,
		    monthdaysStr = "";
		_.each(monthdays, function(obj, index) {
			monthdaysStr += moment(obj.monthday, monthdayInputFormat).format(monthdayOutputFormat);
			if (index < mCount) {
				if (index === mLastBefore) {
					monthdaysStr += " " + $.strings.strAnd + " ";
				} else {
					monthdaysStr += ", ";
				}
			}
		});
		optionRows.push(Alloy.createController("itemTemplates/promptReply", {
			frequencyId : frequencyId,
			pickerType : "monthdays",
			value : monthdays,
			inputFormat : monthdayInputFormat,
			outputFormat : monthdayOutputFormat,
			prompt : $.strings.remindersMedSettingsLblRemindOn,
			reply : monthdaysStr,
			promptClasses : promptClasses,
			replyClasses : replyClasses,
			hasChild : true
		}));
		break;
	case apiCodes.reminder_frequency_onaday:
		var dayOfYearInputFormat = apiCodes.dob_format,
		    dayOfYearOutputFormat = "Do MMM",
		    dayOfYear = reminder.day_of_year || moment().format(apiCodes.dob_format);
		optionRows.push(Alloy.createController("itemTemplates/promptReply", {
			frequencyId : frequencyId,
			pickerType : "date",
			value : dayOfYear,
			inputFormat : dayOfYearInputFormat,
			outputFormat : dayOfYearOutputFormat,
			prompt : $.strings.remindersMedSettingsLblRemindOn,
			reply : moment(dayOfYear, dayOfYearInputFormat).format(dayOfYearOutputFormat),
			promptClasses : promptClasses,
			replyClasses : replyClasses,
			hasChild : true
		}));
		break;
	case apiCodes.reminder_frequency_period:
		break;
	}
	return optionRows;
}

function getPrescRow(prescription) {
	var row = Alloy.createController("itemTemplates/masterDetailBtn", prescription);
	row.on("clickdetail", didClickRemovePresc);
	return row;
}

function focus() {
	if (selectedPrescriptions.length) {
		/**
		 * make existing first row removable
		 * if prescriptions.length is already > 1 then it would already be removable
		 */
		if (prescriptions.length == 1) {
			var prescFirstIndex = $.reminderSection.rowCount,
			    currentCtrl = rows[prescFirstIndex],
			    currentRow = currentCtrl.getView(),
			    currentParams = currentCtrl.getParams();
			_.extend(currentParams, removableDict);
			rows[prescFirstIndex] = getPrescRow(currentParams);
			$.tableView.updateRow( OS_IOS ? prescFirstIndex : currentRow, rows[prescFirstIndex].getView());
		}
		_.each(selectedPrescriptions, function(prescription) {
			prescriptions.push(prescription);
			_.extend(prescription, removableDict);
			var row = getRow(prescription);
			$.tableView.insertRowAfter($.prescSection.rowCount - 1, row.getView());
			rows.push(row);
		});
		selectedPrescriptions = [];
	} else if (selectedColor) {
		//color picker is always on 0th index
		if (selectedColor.hex != rows[0].getParams().color) {
			updateColorBoxRow(selectedColor.hex);
		}
		//nullify
		selectedColor = null;
	}
}

function didClickAddPresc(e) {
	$.app.navigator.open({
		titleid : "titleRemindersMedPrescriptions",
		ctrl : "prescriptions",
		ctrlArguments : {
			isMedReminder : true,
			prescriptions : selectedPrescriptions,
			patientSwitcherDisabled : true,
			showHiddenPrescriptions : true,
			preventRefillValidation : true,
			selectable : true,
			useCache : true
		},
		stack : true
	});
}

function didClickRemovePresc(e) {
	var params = e.data;
	rows = _.reject(rows, function(row) {
		return row.getParams().id === params.id;
	});
	prescriptions = _.reject(prescriptions, function(prescription) {
		return prescription.id === params.id;
	});
	$.tableView.deleteRow(e.source.getView());
	/**
	 *  make existing first row not removable
	 * if prescriptions.length === 1
	 */
	if (prescriptions.length == 1) {
		var prescFirstIndex = $.reminderSection.rowCount,
		    currentCtrl = rows[prescFirstIndex],
		    currentRow = currentCtrl.getView(),
		    currentParams = currentCtrl.getParams();
		_.extend(currentParams, nonRemovableDict);
		rows[prescFirstIndex] = getPrescRow(currentParams);
		$.tableView.updateRow( OS_IOS ? prescFirstIndex : currentRow, rows[prescFirstIndex].getView());
	}
}

function didClickTableView(e) {
	var index = e.index,
	    row = rows[index];
	if (row) {
		switch(index) {
		case 0:
			selectedColor = {
				hex : rows[index].getParams().color
			};
			$.app.navigator.open({
				titleid : "titleRemindersMedColorPicker",
				ctrl : "colorPicker",
				ctrlArguments : {
					color : selectedColor
				},
				stack : true
			});
			break;
		case 1:
			$.frequencyPicker.show();
			break;
		}
	}
}

function didClickFrequencyClose(e) {
	$.frequencyPicker.hide();
}

function didClickFrequencyPicker(e) {
	/**
	 * frequency row will always
	 * be in 1st index
	 */
	var frequencyId = e.data.id,
	    rowIndex = 1,
	    currentRow = OS_IOS ? rowIndex : rows[rowIndex].getView();
	rows[rowIndex] = getFrequencyRow(frequencyId);
	$.tableView.updateRow(currentRow, rows[rowIndex].getView());
	/**
	 * delete all
	 * existing option rows
	 * and clean up rows array
	 */
	var startOptionIndex = 1,
	    endOptionIndex = $.reminderSection.rowCount;
	rows = _.reject(rows, function(row, index) {
		if (index > startOptionIndex && index < endOptionIndex) {
			$.tableView.deleteRow(row.getView());
			return true;
		}
		return false;
	});
	/**
	 * add current options
	 * new index will be 1, as
	 * 0 for color box
	 * 1 for frequency
	 * others in the section is now deleted
	 * with code above
	 */
	_.each(getOptionRows(frequencyId, {}), function(row) {
		$.tableView.insertRowAfter(startOptionIndex, row.getView());
		//increment
		startOptionIndex++;
		/**
		 * new option rows
		 * should be injected in the middle
		 * of rows array - right after
		 * frequency row and before prescription row
		 */
		rows.splice(startOptionIndex, 0, row);
	});
}

function updateColorBoxRow(color) {
	/**
	 * color box row will always
	 * be in 0th index
	 */
	var rowIndex = 0,
	    currentRow = OS_IOS ? rowIndex : rows[rowIndex].getView();
	rows[rowIndex] = getColorBoxRow(color);
	$.tableView.updateRow(currentRow, rows[rowIndex].getView());
}

function didClickSubmitReminder(e) {

}

function didClickRemoveReminder(e) {

}

function hideAllPopups(e) {
	if ($.frequencyPicker && $.frequencyPicker.getVisible()) {
		return $.frequencyPicker.hide();
	}
	return false;
}

exports.init = init;
exports.focus = focus;
exports.backButtonHandler = hideAllPopups;
