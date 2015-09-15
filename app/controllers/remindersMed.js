var args = arguments[0] || {},
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
		keepLoader : true,
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
	 * reminders get api should be called
	 * to fulfill the requirement of the screen
	 */
	if (Alloy.Collections.remindersMed.length) {
		//starting from 1st index
		getReminder(0);
	} else {
		processList();
	}
}

function getReminder(index) {
	$.http.request({
		method : "reminders_med_get",
		params : {
			feature_code : "THXXX",
			data : [{
				reminders : {
					type : apiCodes.reminder_type_med,
					id : Alloy.Collections.remindersMed.at(index).get("id")
				}
			}]
		},
		passthrough : index,
		keepLoader : true,
		errorDialogEnabled : false,
		success : didGetReminder,
		failure : didGetReminder
	});
}

function didGetReminder(result, passthrough) {
	/**
	 * may be a failure, better check it
	 * if failure, remove that model
	 * for safer side
	 */
	if (result.data) {
		Alloy.Collections.remindersMed.at(passthrough).set(result.data);
	} else {
		Alloy.Collections.remindersMed.remove(Alloy.Collections.remindersMed.at(passthrough));
	}
	//try next index if any
	passthrough++;
	if (passthrough < Alloy.Collections.remindersMed.length) {
		getReminder(passthrough);
	} else {
		processList();
	}
}

function processList() {
	//hide loader here
	$.app.navigator.hideLoader();
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
			id : reminderPrescs[0].prescriptionID
		}).get("presc_name"));
		if (len > 1) {
			//when > 1 and switch case used for defining when it is == 2, ==3 and > 3
			switch(len) {
			case 2:
				subtitle += " " + $.strings.strAnd + " " + $.utilities.ucword(Alloy.Collections.prescriptions.findWhere({
					id : reminderPrescs[1].prescriptionID
				}).get("presc_name"));
				break;
			case 3:
				subtitle += ", " + $.utilities.ucword(Alloy.Collections.prescriptions.findWhere({
					id : reminderPrescs[1].prescriptionID
				}).get("presc_name")) + " " + $.strings.strAnd + " " + $.utilities.ucword(Alloy.Collections.prescriptions.findWhere({
					id : reminderPrescs[2].prescriptionID
				}).get("presc_name"));
				break;
			default:
				subtitle += ", " + $.utilities.ucword(Alloy.Collections.prescriptions.findWhere({
					id : reminderPrescs[1].prescriptionID
				}).get("presc_name")) + " " + $.strings.strAnd + " [" + (len - 2) + "] " + $.strings.strMore;
			}
		}
	}
	model.set({
		color : model.get("color_code"),
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
							dosage : {
								reminders_id : data.id
							}
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
}

function didClickTableView(e) {
	if (Alloy.Globals.currentRow) {
		return Alloy.Globals.currentRow.touchEnd();
	}
}

function didClickAdd(e) {
	currentReminder = {};
	$.app.navigator.open({
		titleid : "titleRemindersMedSettings",
		ctrl : "remindersMedSettings",
		ctrlArguments : {
			isUpdate : false,
			reminder : currentReminder
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
