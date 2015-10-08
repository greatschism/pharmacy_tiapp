var args = arguments[0] || {},
    moment = require("alloy/moment"),
    apiCodes = Alloy.CFG.apiCodes,
    titleClasses = ["content-title-wrap"],
    subtitleClasses = ["content-subtitle-wrap"],
    rows,
    swipeOptions,
    currentReminder,
    isWindowOpen;

function init() {
	//table top
	var top = $.uihelper.getHeightFromChildren($.headerView);
	$.tableView.top = top;
	$.addView.top = top;
	//swipe
	swipeOptions = [{
		action : 1,
		title : $.strings.remindersMedSwipeOptRemove,
		type : "negative"
	}];
	//patient switcher
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
}

function focus() {
	/*
	 * avoid null pointer if another controller or another instance of this controller
	 * used this global variable in it's life span
	 */
	Alloy.Globals.currentTable = $.tableView;
	if (!isWindowOpen) {
		isWindowOpen = true;
		getAllPrescriptions();
	} else if (currentReminder.method) {
		var method = currentReminder.method;
		/**
		 * to prevent method property
		 * added to model / collection
		 * delete it before adding / processing
		 */
		delete currentReminder.method;
		switch(method) {
		case "reminders_med_add":
			/**
			 * if this is the first row
			 * then addView will be visible
			 * hide it and show the table back
			 */
			if (!rows.length) {
				$.addView.visible = false;
				$.contentHeaderView.visible = true;
			}
			//update collection
			Alloy.Collections.remindersMed.add(currentReminder);
			//add row
			var row = processModel(Alloy.Collections.remindersMed.last());
			$.tableView.appendRow(row.getView());
			rows.push(row);
			break;
		case "reminders_med_update":
			delete currentReminder.updated;
			_.some(rows, function(row, index) {
				if (row.getParams().id == currentReminder.id) {
					var model = Alloy.Collections.remindersMed.at(index);
					model.set(currentReminder);
					var newRow = processModel(model);
					$.tableView.updateRow( OS_IOS ? index : row.getView(), newRow.getView());
					rows[index] = newRow;
					return true;
				}
				return false;
			});
			break;
		case "reminders_med_delete":
			didDeleteReminder(null, currentReminder);
			break;
		}
		currentReminder = null;
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
					sort_order_preferences : apiCodes.prescriptions_sort_by_name,
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
	//get reminders
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
		errorDialogEnabled : false,
		success : didGetReminders,
		failure : didGetReminders
	});
}

function didGetReminders(result, passthrough) {
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
	Alloy.Collections.remindersMed.reset(result.data.reminders);
	/**
	 * toggle add view & content header view
	 * if no reminders
	 */
	rows = [];
	var data = [];
	if (Alloy.Collections.remindersMed.length) {
		if ($.addView.visible) {
			$.addView.visible = false;
		}
		if (!$.contentHeaderView.visible) {
			$.contentHeaderView.visible = true;
		}
		Alloy.Collections.remindersMed.each(function(model) {
			var row = processModel(model);
			data.push(row.getView());
			rows.push(row);
		});
	} else {
		//toggle views
		if ($.contentHeaderView.visible) {
			$.contentHeaderView.visible = false;
		}
		if (!$.addView.visible) {
			$.addView.visible = true;
		}
	}
	//reset table
	$.tableView.setData(data);
	/*
	 *  reset the swipe flag
	 *  once a fresh list is loaded
	 *  not resetting this block further swipe actions
	 */
	Alloy.Globals.isSwipeInProgress = false;
	Alloy.Globals.currentRow = null;
}

function processModel(model) {
	/**
	 * timings
	 */
	var frequency = model.get("frequency"),
	    title;
	switch(frequency) {
	case apiCodes.reminder_frequency_daily:
		var dailyTimes = model.get("reminder_start_hour"),
		    dCount = dailyTimes.length - 1,
		    dLastBefore = dCount - 1,
		    timesStr = "";
		_.each(dailyTimes, function(time, index) {
			timesStr += moment(time.hour + ":" + time.minutes, "HH:mm").format(Alloy.CFG.time_format);
			if (index < dCount) {
				if (index === dLastBefore) {
					timesStr += " " + $.strings.strAnd + " ";
				} else {
					timesStr += ", ";
				}
			}
		});
		title = String.format($.strings["remindersMedLblFrequency".concat(frequency)], timesStr);
		break;
	case apiCodes.reminder_frequency_weekly:
		var wTime = model.get("reminder_start_hour")[0],
		    weekdays = model.get("day_of_week"),
		    wCount = weekdays.length - 1,
		    wLastBefore = wCount - 1,
		    weekdayFormat = wCount === 0 ? "dddd" : "dd",
		    weekdaysStr = "";
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
		title = String.format($.strings["remindersMedLblFrequency".concat(frequency)], weekdaysStr, moment(wTime.hour + ":" + wTime.minutes, "HH:mm").format(Alloy.CFG.time_format));
		break;
	case apiCodes.reminder_frequency_monthly:
		var mTime = model.get("reminder_start_hour")[0],
		    monthdays = model.get("day_of_month"),
		    mCount = monthdays.length - 1,
		    mLastBefore = mCount - 1,
		    monthdaysStr = "";
		_.each(monthdays, function(day, index) {
			/**
			 * Jan has 31 days, so always
			 * keeping month as 1
			 */
			monthdaysStr += moment(day.monthday + "-1", "D[-]M").format("Do");
			if (index < mCount) {
				if (index === mLastBefore) {
					monthdaysStr += " " + $.strings.strAnd + " ";
				} else {
					monthdaysStr += ", ";
				}
			}
		});
		title = String.format($.strings["remindersMedLblFrequency".concat(frequency)], monthdaysStr, moment(mTime.hour + ":" + mTime.minutes, "HH:mm").format(Alloy.CFG.time_format));
		break;
	case apiCodes.reminder_frequency_onaday:
		var dTime = model.get("reminder_start_hour")[0];
		title = String.format($.strings["remindersMedLblFrequency".concat(frequency)], moment(model.get("day_of_year"), apiCodes.dob_format).format("Do MMMM"), moment(dTime.hour + ":" + dTime.minutes, "HH:mm").format(Alloy.CFG.time_format));
		break;
	case apiCodes.reminder_frequency_period:
		var mEndDate = moment(model.get("reminder_end_date"), apiCodes.ymd_date_time_format),
		    pTime = model.get("reminder_start_hour")[0],
		    interval = model.get("period"),
		    formattedInterval;
		if (interval < 60) {
			formattedInterval = interval + " " + $.strings.strMinutes;
		} else {
			interval /= 60;
			formattedInterval = interval + " " + $.strings[interval > 1 ? "strHours" : "strHour"];
		}
		title = String.format($.strings["remindersMedLblFrequency".concat(frequency)], formattedInterval, mEndDate.format(Alloy.CFG.date_format), moment(pTime.hour + ":" + pTime.minutes, "HH:mm").format(Alloy.CFG.time_format), mEndDate.format(Alloy.CFG.time_format));
		break;
	}
	/* Description format
	 * 1 drug [DRUGNAME].
	 * 2 drugs [DRUGNAME] and [DRUGNAME].
	 * 3 drugs [DRUGNAME], [DRUGNAME] and [DRUGNAME].
	 * 4 or more [DRUGNAME], [DRUGNAME], and [X] more.
	 * Note: length can't be 0
	 */
	var reminderPrescs = model.get("prescriptions") || [],
	    len = reminderPrescs.length,
	    subtitle;
	if (len > 0) {
		subtitle = $.utilities.ucword(Alloy.Collections.prescriptions.findWhere({
			id : reminderPrescs[0].id
		}).get("presc_name"));
		if (len > 1) {
			//when > 1 and switch case used for defining when it is == 2, ==3 and > 3
			switch(len) {
			case 2:
				subtitle += " " + $.strings.strAnd + " " + $.utilities.ucword(Alloy.Collections.prescriptions.findWhere({
					id : reminderPrescs[1].id
				}).get("presc_name"));
				break;
			case 3:
				subtitle += ", " + $.utilities.ucword(Alloy.Collections.prescriptions.findWhere({
					id : reminderPrescs[1].id
				}).get("presc_name")) + " " + $.strings.strAnd + " " + $.utilities.ucword(Alloy.Collections.prescriptions.findWhere({
					id : reminderPrescs[2].id
				}).get("presc_name"));
				break;
			default:
				subtitle += ", " + $.utilities.ucword(Alloy.Collections.prescriptions.findWhere({
					id : reminderPrescs[1].id
				}).get("presc_name")) + " " + $.strings.strAnd + " [" + (len - 2) + "] " + $.strings.strMore;
			}
		}
	}
	model.set({
		color : model.get("color_code"),
		title : title,
		subtitle : subtitle,
		titleClasses : titleClasses,
		subtitleClasses : subtitleClasses,
		options : swipeOptions
	});
	var row = Alloy.createController("itemTemplates/contentViewWithLColorBox", model.toJSON());
	row.on("clickoption", didClickSwipeOption);
	return row;
}

function didClickSwipeOption(e) {
	if (Alloy.Globals.currentRow) {
		Alloy.Globals.currentRow.touchEnd();
	}
	/**
	 * we have only one option now, so no need for any further validation
	 * just confirm and remove reminder
	 */
	var data = e.data;
	$.uihelper.showDialog({
		message : $.strings.remindersMedMsgRemoveConfirm,
		buttonNames : [$.strings.dialogBtnYes, $.strings.dialogBtnNo],
		cancelIndex : 1,
		success : function() {
			$.http.request({
				method : "reminders_med_delete",
				params : {
					feature_code : "THXXX",
					data : [{
						reminders : {
							id : data.id,
							type : apiCodes.reminder_type_med
						}
					}]
				},
				passthrough : data,
				success : didDeleteReminder
			});
		}
	});
}

function didDeleteReminder(result, passthrough) {
	/**
	 * no need to call the list api
	 * as it is a successful delete
	 * and api is going to return the same data set
	 */
	rows = _.reject(rows, function(row, index) {
		if (passthrough.id === row.getParams().id) {
			$.tableView.deleteRow(row.getView());
			return true;
		}
		return false;
	});
	//remove model from collection
	Alloy.Collections.remindersMed.remove(Alloy.Collections.remindersMed.findWhere({
		id : passthrough.id
	}));
	/**
	 * toggle views
	 * if all rows are deleted
	 * No need to check for visibility
	 * as this is a delete, table should be visible
	 * by now
	 */
	if (!rows.length) {
		$.contentHeaderView.visible = false;
		$.addView.visible = true;
	}
}

function didClickTableView(e) {
	if (Alloy.Globals.currentRow) {
		return Alloy.Globals.currentRow.touchEnd();
	}
	var row = rows[e.index];
	if (row) {
		currentReminder = row.getParams();
		$.app.navigator.open({
			titleid : "titleRemindersMedSettings",
			ctrl : "remindersMedSettings",
			ctrlArguments : {
				isUpdate : true,
				reminder : currentReminder
			},
			stack : true
		});
	}
}

function didClickAdd(e) {
	currentReminder = {};
	var firstLaunchReminders = $.utilities.getProperty(Alloy.CFG.first_launch_med_reminders, true, "bool", false);
	if (firstLaunchReminders) {
		$.utilities.setProperty(Alloy.CFG.first_launch_med_reminders, false, "bool", false);
	}
	$.app.navigator.open({
		titleid : "titleRemindersMedPrescriptions",
		ctrl : "prescriptions",
		ctrlArguments : {
			navigation : {
				titleid : "titleRemindersMedSettings",
				ctrl : "remindersMedSettings",
				ctrlArguments : {
					isUpdate : false,
					canAdd : false,
					reminder : currentReminder
				},
				stack : true
			},
			isMedReminder : true,
			sectionHeaderViewDisabled : true,
			showMedReminderTooltip : firstLaunchReminders,
			patientSwitcherDisabled : true,
			showHiddenPrescriptions : true,
			validator : "medReminder",
			selectable : true,
			minLength : 1,
			useCache : true
		},
		stack : true
	});
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
