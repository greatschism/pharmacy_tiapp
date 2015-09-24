var args = arguments[0] || {},
    moment = require("alloy/moment"),
    apiCodes = Alloy.CFG.apiCodes,
    rows = [],
    reminder = args.reminder,
    prescriptions = args.isUpdate ? reminder.prescriptions : args.prescriptions,
    selectedPrescriptions = [],
    frequencyOptions = [],
    dailyOptions = [],
    weekdayOptions = [],
    monthdayOptions = [],
    periodOptions = [],
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
    dateDropdownArgs,
    timeDropdownArgs,
    selectedColor;

function init() {
	/**
	 * update pickers
	 */
	//frequency
	var frequencyId = reminder.frequency || Alloy.CFG.reminder_med_default_frequency;
	_.each(Alloy.CFG.reminder_med_frequencies, function(option) {
		frequencyOptions.push(_.extend(_.clone(option), {
			title : $.strings["remindersMedSettingsLblFrequency" + option.id],
			selected : option.id === frequencyId
		}));
	});
	$.frequencyPicker.setItems(frequencyOptions);
	//daily
	for (var i = 1; i <= Alloy.CFG.reminder_frequency_daily_max_limit; i++) {
		dailyOptions.push({
			title : i + " " + $.strings[i > 1 ? "strTimes" : "strTime"],
			value : i,
			selected : false
		});
	}
	//weekday
	for (var w = 1; w <= 7; w++) {
		var weekday = moment().isoWeekday(w);
		weekdayOptions.push({
			title : weekday.format("dddd"),
			weekday : weekday.format("ddd").toLowerCase(),
			selected : false
		});
	}
	//monthly
	$.monthdayLbl.text = String.format($.strings.remindersMedSettingsPopupSectionMonthday, Alloy.CFG.reminder_frequency_monthly_max_limit);
	for (var m = 1; m <= 31; m++) {
		/**
		 * Jan has 31 days, so always
		 * keeping month as 1
		 */
		monthdayOptions.push({
			title : moment(m + "-1", "D[-]M").format("Do"),
			monthday : m,
			selected : false
		});
	}
	//period
	_.each(Alloy.CFG.reminder_med_periods, function(period) {
		var interval = period.value,
		    formattedInterval;
		if (interval < 60) {
			formattedInterval = interval + " " + $.strings.strMinutes;
		} else {
			interval /= 60;
			formattedInterval = interval + " " + $.strings[interval > 1 ? "strHours" : "strHour"];
		}
		periodOptions.push(_.extend(_.clone(period), {
			title : String.format($.strings.remindersMedSettingsLblRemindInterval, formattedInterval),
			selected : false
		}));
	});
	/**
	 * reminder section
	 */
	$.reminderSection = Ti.UI.createTableViewSection();
	//color box row
	var colorRow = getColorBoxRow(reminder.color_code || Alloy.CFG.default_color);
	$.reminderSection.add(colorRow.getView());
	rows.push(colorRow);
	//remind frequency
	var frequencyRow = getFrequencyRow(frequencyId);
	$.reminderSection.add(frequencyRow.getView());
	rows.push(frequencyRow);
	/**
	 * options section
	 * Note: using separate
	 * section for options
	 * to avoid conflicts
	 * while insertRowAfter / insertRowBefore
	 */
	$.optionsSection = Ti.UI.createTableViewSection();
	//options for this frequency
	_.each(getOptionRows(frequencyId, reminder), function(row) {
		$.optionsSection.add(row.getView());
		rows.push(row);
	});
	/**
	 * notes section
	 * Note: using separate
	 * section for notes
	 * with no rows and just footer view
	 * for match the UI,
	 * placing this in the previous
	 * section's footer view
	 * may be affected when updateSection is
	 * called
	 */
	var txtaStyleDict = $.createStyle({
		classes : ["margin-top", "margin-bottom", "txta", "reminder-notes"]
	});
	$.notesTxta = Alloy.createWidget("ti.textarea", "widget", txtaStyleDict);
	$.footerView = Ti.UI.createView({
		height : txtaStyleDict.top + txtaStyleDict.bottom + txtaStyleDict.height
	});
	if (OS_IOS || Alloy.Globals.isLollipop) {
		$.footerView.add($.UI.create("View", {
			classes : ["top", "h-divider-light"]
		}));
	}
	$.footerView.add($.notesTxta.getView());
	$.notesSection = Ti.UI.createTableViewSection({
		footerView : $.footerView
	});
	/**
	 * prescriptions section
	 */
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
	$.tableView.setData([$.reminderSection, $.optionsSection, $.notesSection, $.prescSection]);
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
	/**
	 * moment().hours() will give the time
	 * on the user prefered time zone
	 * so using new Date().getHours()
	 */
	var optionRows = [],
	    frequencyObj = _.findWhere(frequencyOptions, {
		id : frequencyId
	}),
	    endDate = data.reminder_end_date;
	switch(frequencyId) {
	case apiCodes.reminder_frequency_daily:
		var numberOfTimes = parseInt(data.number_of_times_max) || 1,
		    selectedDaily;
		//update daily picker
		_.each(dailyOptions, function(dailyOpt) {
			dailyOpt.selected = numberOfTimes === dailyOpt.value;
			if (dailyOpt.selected) {
				selectedDaily = dailyOpt;
			}
		});
		$.dailyPicker.setItems(dailyOptions);
		//row
		optionRows.push(Alloy.createController("itemTemplates/promptReply", {
			frequencyId : frequencyId,
			pickerType : "daily",
			value : selectedDaily.value,
			prompt : $.strings.remindersMedSettingsLblRemindTimes,
			reply : selectedDaily.title,
			promptClasses : promptClasses,
			replyClasses : replyClasses,
			hasChild : true
		}));
		/**
		 * set a end date if not set already
		 * Note: calculate end date directly from
		 * moment object may bring time zone issues
		 */
		if (!endDate) {
			endDate = moment(moment().add(1, "week").toDate().toLocaleString("long"), Alloy.CFG.date_format_long).format(apiCodes.reminder_date_time_format);
		}
		break;
	case apiCodes.reminder_frequency_weekly:
		var weekdays = data.day_of_week || [{
			weekday : moment().format("ddd").toLowerCase()
		}],
		    wCount = weekdays.length - 1,
		    wLastBefore = wCount - 1,
		    weekdayFormat = wCount === 0 ? "dddd" : "dd",
		    weekdaysStr = "";
		//update weekly picker
		_.each(weekdayOptions, function(weekdayOpt) {
			weekdayOpt.selected = _.findWhere(weekdays, {
				weekday : weekdayOpt.weekday
			}) ? true : false;
		});
		$.weekdayPicker.setItems(weekdayOptions);
		//process title
		_.each(weekdays, function(day, index) {
			weekdaysStr += moment($.utilities.ucfirst(day.weekday), "ddd").format(weekdayFormat);
			if (index < wCount) {
				if (index === wLastBefore) {
					weekdaysStr += " " + $.strings.strAnd + " ";
				} else {
					weekdaysStr += ", ";
				}
			}
		});
		//row
		optionRows.push(Alloy.createController("itemTemplates/promptReply", {
			frequencyId : frequencyId,
			pickerType : "weekday",
			value : weekdays,
			prompt : $.strings.remindersMedSettingsLblRemindOn,
			reply : weekdaysStr,
			promptClasses : promptClasses,
			replyClasses : replyClasses,
			hasChild : true
		}));
		/**
		 * set a end date if not set already
		 * Note: calculate end date directly from
		 * moment object may bring time zone issues
		 */
		if (!endDate) {
			endDate = moment(moment().add(1, "month").toDate().toLocaleString("long"), Alloy.CFG.date_format_long).format(apiCodes.reminder_date_time_format);
		}
		break;
	case apiCodes.reminder_frequency_monthly:
		var monthdays = data.day_of_month || [{
			monthday : moment().date()
		}],
		    mCount = monthdays.length - 1,
		    mLastBefore = mCount - 1,
		    monthdaysStr = "";
		//update monthly picker
		_.each(monthdayOptions, function(monthdayOpt) {
			monthdayOpt.selected = _.findWhere(monthdays, {
				monthday : monthdayOpt.monthday
			}) ? true : false;
		});
		$.monthdayPicker.setItems(monthdayOptions);
		//process title
		_.each(monthdays, function(day, index) {
			monthdaysStr += moment(day.monthday + "-1", "D[-]M").format("Do");
			if (index < mCount) {
				if (index === mLastBefore) {
					monthdaysStr += " " + $.strings.strAnd + " ";
				} else {
					monthdaysStr += ", ";
				}
			}
		});
		//row
		optionRows.push(Alloy.createController("itemTemplates/promptReply", {
			frequencyId : frequencyId,
			pickerType : "monthday",
			value : monthdays,
			prompt : $.strings.remindersMedSettingsLblRemindOn,
			reply : monthdaysStr,
			promptClasses : promptClasses,
			replyClasses : replyClasses,
			hasChild : true
		}));
		/**
		 * set a end date if not set already
		 * Note: calculate end date directly from
		 * moment object may bring time zone issues
		 */
		if (!endDate) {
			endDate = moment(moment().add(1, "year").toDate().toLocaleString("long"), Alloy.CFG.date_format_long).format(apiCodes.reminder_date_time_format);
		}
		break;
	case apiCodes.reminder_frequency_onaday:
		var dayOfYear = reminder.day_of_year || moment().format(apiCodes.dob_format);
		optionRows.push(Alloy.createController("itemTemplates/promptReply", {
			frequencyId : frequencyId,
			pickerType : "date",
			inputFormat : apiCodes.dob_format,
			outputFormat : "Do MMM",
			value : dayOfYear,
			prompt : $.strings.remindersMedSettingsLblRemindOn,
			reply : moment(dayOfYear, apiCodes.dob_format).format("Do MMM"),
			promptClasses : promptClasses,
			replyClasses : replyClasses,
			hasChild : true
		}));
		/**
		 * set a end date if not set already
		 * Note: calculate end date directly from
		 * moment object may bring time zone issues
		 */
		if (!endDate) {
			endDate = moment(moment().add(1, "year").toDate().toLocaleString("long"), Alloy.CFG.date_format_long).format(apiCodes.reminder_date_time_format);
		}
		break;
	case apiCodes.reminder_frequency_period:
		var period = data.period || periodOptions[0].value,
		    selectedPeriod;
		//update period picker
		_.each(periodOptions, function(periodOpt) {
			periodOpt.selected = period === periodOpt.value;
			if (periodOpt.selected) {
				selectedPeriod = periodOpt;
			}
		});
		$.periodPicker.setItems(periodOptions);
		//row
		optionRows.push(Alloy.createController("itemTemplates/promptReply", {
			frequencyId : frequencyId,
			pickerType : "period",
			value : selectedPeriod.value,
			prompt : $.strings.remindersMedSettingsLblRemindPeriod,
			reply : selectedPeriod.title,
			promptClasses : promptClasses,
			replyClasses : replyClasses,
			hasChild : true
		}));
		/**
		 * set a end date if not set already
		 * Note: calculate end date directly from
		 * moment object may bring time zone issues
		 */
		if (!endDate) {
			endDate = moment(moment().toDate().toLocaleString("long"), Alloy.CFG.date_format_long).format(apiCodes.reminder_date_time_format);
		}
		break;
	}
	/**
	 * all reminders will have
	 * start_hours
	 */
	var startHours = data.reminder_start_hour || [{
		hour : new Date().getHours(),
		minutes : "00"
	}];
	_.each(startHours, function(time, index) {
		var prompt = $.strings[frequencyId === apiCodes.reminder_frequency_period ? "remindersMedSettingsLblRemindOnwards" : "remindersMedSettingsLblRemindAt"];
		optionRows.push(Alloy.createController("itemTemplates/promptReply", {
			frequencyId : frequencyId,
			pickerType : "time",
			value : time,
			prompt : prompt,
			reply : moment(time.hour + ":" + time.minutes, "HH:mm").format(Alloy.CFG.time_format),
			promptClasses : promptClasses,
			replyClasses : replyClasses,
			hasChild : true
		}));
	});
	/**
	 * all reminders have
	 * reminder_end_date
	 * but can be enabled based
	 * on the flag
	 */
	optionRows.push(Alloy.createController("itemTemplates/promptReply", {
		frequencyId : frequencyId,
		pickerType : frequencyObj.reminder_end_date_enabled ? "date" : "ignore",
		inputFormat : apiCodes.reminder_date_time_format,
		outputFormat : Alloy.CFG.date_format,
		value : endDate,
		prompt : $.strings.remindersMedSettingsLblRemindEnd,
		reply : moment(endDate, apiCodes.reminder_date_time_format).format(Alloy.CFG.date_format),
		promptClasses : promptClasses,
		replyClasses : replyClasses,
		hasChild : frequencyObj.reminder_end_date_enabled
	}));
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
			var prescFirstIndex = $.reminderSection.rowCount + $.optionsSection.rowCount,
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
		var prescFirstIndex = $.reminderSection.rowCount + $.optionsSection.rowCount,
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
	//hide keyboard
	hideKeyboard();
	//process row
	if (row) {
		var params = rows[index].getParams();
		if (index === 0) {
			selectedColor = {
				hex : params.color
			};
			$.app.navigator.open({
				titleid : "titleRemindersMedColorPicker",
				ctrl : "colorPicker",
				ctrlArguments : {
					color : selectedColor
				},
				stack : true
			});
		} else if (index === 1) {
			$.frequencyPicker.show();
		} else {
			var pickerType = params.pickerType;
			if (pickerType == "date") {
				showDatePicker(params.value, params.inputFormat, params.outputFormat, index);
			} else if (pickerType == "time") {
				showTimePicker(params.value, index);
			} else {
				var picker = $[pickerType.concat("Picker")];
				//verify whether picker is valid (might be invalid when disabled)
				if (picker) {
					//to identify the row after selection
					picker.rowIndex = index;
					picker.show();
				}
			}
		}
	}
}

function didClickClosePicker(e) {
	var pickerId = e.source.picker,
	    picker = $[pickerId],
	    index = picker.rowIndex,
	    currentCtrl = rows[index],
	    currentRow = currentCtrl && currentCtrl.getView(),
	    currentParams = currentCtrl && currentCtrl.getParams();
	/**
	 * process the values here for monthly
	 * rest are radio type
	 * but this allows multiple selections
	 */
	if (pickerId === "weekdayPicker") {
		var weekdays = picker.getSelectedItems(),
		    wCount = weekdays.length - 1,
		    wLastBefore = wCount - 1,
		    weekdayFormat = wCount === 0 ? "dddd" : "dd",
		    weekdaysStr = "";
		if (wCount < 0) {
			$.uihelper.showDialog({
				message : $.strings.remindersMedSettingsValWeekday
			});
			return false;
		}
		_.each(weekdays, function(day, wIndex) {
			weekdaysStr += moment($.utilities.ucfirst(day.weekday), "ddd").format(weekdayFormat);
			if (wIndex < wCount) {
				if (wIndex === wLastBefore) {
					weekdaysStr += " " + $.strings.strAnd + " ";
				} else {
					weekdaysStr += ", ";
				}
			}
		});
		//update row
		_.extend(currentParams, {
			value : weekdays,
			reply : weekdaysStr
		});
		rows[index] = Alloy.createController("itemTemplates/promptReply", currentParams);
		$.tableView.updateRow( OS_IOS ? index : currentRow.getView(), rows[index].getView());
	} else if (pickerId === "monthdayPicker") {
		var monthdays = picker.getSelectedItems(),
		    mCount = monthdays.length - 1,
		    mLastBefore = mCount - 1,
		    monthdaysStr = "";
		if (mCount < 0) {
			$.uihelper.showDialog({
				message : $.strings.remindersMedSettingsValMonthday
			});
			return false;
		}
		_.each(monthdays, function(day, index) {
			monthdaysStr += moment(day.monthday + "-1", "D[-]M").format("Do");
			if (index < mCount) {
				if (index === mLastBefore) {
					monthdaysStr += " " + $.strings.strAnd + " ";
				} else {
					monthdaysStr += ", ";
				}
			}
		});
		//update row
		_.extend(currentParams, {
			value : monthdays,
			reply : monthdaysStr
		});
		rows[index] = Alloy.createController("itemTemplates/promptReply", currentParams);
		$.tableView.updateRow( OS_IOS ? index : currentRow.getView(), rows[index].getView());
	}
	//delete reference
	delete $.dailyPicker.rowIndex;
	//hide
	picker.hide();
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
	 * update new options
	 * to the section
	 */
	$.optionsSection = Ti.UI.createTableViewSection();
	var newRows = getOptionRows(frequencyId, reminder);
	_.each(newRows, function(row) {
		$.optionsSection.add(row.getView());
	});
	$.tableView.updateSection(1, $.optionsSection);
	/**
	 * new option rows
	 * should be injected in the middle
	 * of rows array - right after
	 * frequency row and before prescription row
	 */
	Array.prototype.splice.apply(rows, [2, 0].concat(newRows));
}

function didClickDailyPicker(e) {
	var data = e.data,
	    index = $.dailyPicker.rowIndex,
	    currentCtrl = rows[index],
	    currentRow = currentCtrl.getView(),
	    currentParams = currentCtrl.getParams(),
	    currentValue = currentParams.value;
	//delete reference
	delete $.dailyPicker.rowIndex;
	//extend new properties
	_.extend(currentParams, {
		value : data.value,
		reply : data.title
	});
	/**
	 * update row
	 */
	rows[index] = Alloy.createController("itemTemplates/promptReply", currentParams);
	$.tableView.updateRow( OS_IOS ? index : currentRow, rows[index].getView());
	/**
	 * if reduced the number of items
	 * delete additional rows
	 */
	if (currentValue > data.value) {
		//delete rows form table
		var dStartIndex = index + currentValue,
		    dEndIndex = dStartIndex - (currentValue - data.value);
		for (var d = dStartIndex; d > dEndIndex; d--) {
			$.tableView.deleteRow(rows[d].getView());
		}
		//update rows array
		rows = _.reject(rows, function(row, rIndex) {
			if (rIndex <= dStartIndex && rIndex > dEndIndex) {
				return true;
			}
			return false;
		});
	} else {
		/**
		 * else count has been increased,
		 * so insert rows
		 */
		var nStartIndex = index,
		    nEndIndex = nStartIndex + (data.value - currentValue),
		    newRows = [];
		for (var n = nStartIndex; n < nEndIndex; n++) {
			var time = {
				hour : new Date().getHours(),
				minutes : "00"
			},
			    newRow = Alloy.createController("itemTemplates/promptReply", {
				frequencyId : apiCodes.reminder_frequency_daily,
				pickerType : "time",
				value : time,
				prompt : $.strings.remindersMedSettingsLblRemindAt,
				reply : moment(time.hour + ":" + time.minutes, "HH:mm").format(Alloy.CFG.time_format),
				promptClasses : promptClasses,
				replyClasses : replyClasses,
				hasChild : true
			});
			$.tableView.insertRowAfter(n, newRow.getView());
			newRows.push(newRow);
		}
		/**
		 * new option rows
		 * should be injected in the middle
		 * of rows array - right after
		 * frequency row and before prescription row
		 */
		Array.prototype.splice.apply(rows, [nStartIndex + 1, 0].concat(newRows));
	}
}

function didClickPeriodPicker(e) {
	var data = e.data,
	    index = $.periodPicker.rowIndex,
	    currentCtrl = rows[index],
	    currentRow = currentCtrl.getView(),
	    currentParams = currentCtrl.getParams(),
	    currentValue = currentParams.value;
	//delete reference
	delete $.periodPicker.rowIndex;
	//extend new properties
	_.extend(currentParams, {
		value : data.value,
		reply : data.title
	});
	/**
	 * update row
	 */
	rows[index] = Alloy.createController("itemTemplates/promptReply", currentParams);
	$.tableView.updateRow( OS_IOS ? index : currentRow, rows[index].getView());
}

function showDatePicker(dValue, inputFormat, outputFormat, rowIndex) {
	var date = moment(dValue, inputFormat).toDate();
	dateDropdownArgs.value = date;
	if (OS_ANDROID) {
		var dPicker = Ti.UI.createPicker();
		dPicker.showDatePickerDialog({
			title : dateDropdownArgs.title,
			okButtonTitle : dateDropdownArgs.rightTitle,
			value : dateDropdownArgs.value,
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
					updateRemindOnRow(moment(value.toLocaleString(), dateDropdownArgs.formatLong).toDate(), inputFormat, outputFormat, rowIndex);
				}
			}
		});
	} else if (OS_IOS) {
		$.datePicker = Alloy.createWidget("ti.dropdown", "datePicker", dateDropdownArgs);
		$.datePicker.on("terminate", function didTerminateDatePicker(e) {
			if ($.datePicker) {
				$.datePicker.off("terminate", didTerminateDatePicker);
				if (e.value) {
					updateRemindOnRow(e.value, inputFormat, outputFormat, rowIndex);
				}
				$.datePicker = null;
			}
		});
		$.datePicker.init();
	}
}

function updateRemindOnRow(date, inputFormat, outputFormat, rowIndex) {
	var selectedMoment = moment(date),
	    currentCtrl = rows[rowIndex],
	    currentRow = currentCtrl.getView(),
	    currentParams = currentCtrl.getParams();
	_.extend(currentParams, {
		value : selectedMoment.format(inputFormat),
		reply : selectedMoment.format(outputFormat)
	});
	rows[rowIndex] = Alloy.createController("itemTemplates/promptReply", currentParams);
	$.tableView.updateRow( OS_IOS ? rowIndex : currentRow, rows[rowIndex].getView());
}

function showTimePicker(time, rowIndex) {
	var date = new Date();
	date.setHours(time.hour);
	date.setMinutes(time.minutes);
	timeDropdownArgs.value = date;
	if (OS_ANDROID) {
		var dPicker = Ti.UI.createPicker();
		dPicker.showTimePickerDialog({
			title : timeDropdownArgs.title,
			okButtonTitle : timeDropdownArgs.rightTitle,
			value : timeDropdownArgs.value,
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
					updateRemindAtRow(moment(value.toLocaleString(), timeDropdownArgs.formatLong).toDate(), rowIndex);
				}
			}
		});
	} else if (OS_IOS) {
		$.timePicker = Alloy.createWidget("ti.dropdown", "datePicker", timeDropdownArgs);
		$.timePicker.on("terminate", function didTerminateTimePicker(e) {
			if ($.timePicker) {
				$.timePicker.off("terminate", didTerminateTimePicker);
				if (e.value) {
					updateRemindAtRow(e.value, rowIndex);
				}
				$.timePicker = null;
			}
		});
		$.timePicker.init();
	}
}

function updateRemindAtRow(value, rowIndex) {
	var selectedMoment = moment(value),
	    currentCtrl = rows[rowIndex],
	    currentRow = currentCtrl.getView(),
	    currentParams = currentCtrl.getParams();
	_.extend(currentParams, {
		value : {
			hour : selectedMoment.format("HH"),
			minutes : selectedMoment.format("mm")
		},
		reply : selectedMoment.format(Alloy.CFG.time_format)
	});
	rows[rowIndex] = Alloy.createController("itemTemplates/promptReply", currentParams);
	$.tableView.updateRow( OS_IOS ? rowIndex : currentRow, rows[rowIndex].getView());
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

function hideKeyboard() {
	if (Ti.App.keyboardVisible) {
		Ti.App.hideKeyboard();
	}
}

function didClickSubmitReminder(e) {
	//hide keyboard
	hideKeyboard();
	//process submit
}

function didClickRemoveReminder(e) {
	//hide keyboard
	hideKeyboard();
	//process remove
}

function setParentView(view) {
	dateDropdownArgs = $.createStyle({
		classes : ["dropdown", "date"]
	});
	_.extend(dateDropdownArgs, {
		minDate : new Date(),
		parent : view
	});
	timeDropdownArgs = $.createStyle({
		classes : ["dropdown", "time"]
	});
	timeDropdownArgs.parent = view;
}

function hideAllPopups(e) {
	if ($.frequencyPicker && $.frequencyPicker.getVisible()) {
		return $.frequencyPicker.hide();
	}
	if ($.weekdayPicker && $.weekdayPicker.getVisible()) {
		/**
		 * weekday picker has
		 * it's own logics
		 * before close
		 * don't hide here
		 */
		return true;
	}
	if ($.monthdayPicker && $.monthdayPicker.getVisible()) {
		/**
		 * weekday picker has
		 * it's own logics
		 * before close
		 * don't hide here
		 */
		return true;
	}
	if ($.periodPicker && $.periodPicker.getVisible()) {
		return $.periodPicker.hide();
	}
	return false;
}

exports.init = init;
exports.focus = focus;
exports.setParentView = setParentView;
exports.backButtonHandler = hideAllPopups;
