var args = arguments[0] || {},
    apiCodes = Alloy.CFG.apiCodes,
    titleClasses = ["content-title-wrap"],
    subtitleClasses = ["content-subtitle-wrap"],
    rows,
    swipeOptions,
    headerBtnDict,
    currentDoctor,
    isWindowOpen;

function init() {
	headerBtnDict = $.createStyle({
		classes : ["content-header-right-icon", "icon-add"]
	});
	swipeOptions = [{
		action : 1,
		title : $.strings.doctorsSwipeOptRemove,
		type : "negative"
	}];
}

function focus() {
	/*
	 * avoid null pointer if another controller or another instance of this controller
	 * used this global variable in it's life span
	 */
	Alloy.Globals.currentTable = $.tableView;
	/**
	 * keep api calls in focus and validate
	 * window open by first focus flag - isWindowOpen
	 */
	if (!isWindowOpen) {
		isWindowOpen = true;
		$.http.request({
			method : "doctors_list",
			params : {
				feature_code : "THXXX",
				filter : {
					sort_type : apiCodes.doctors_sort_type_asc,
					sort_by : apiCodes.doctors_sort_by_fname
				}
			},
			keepLoader : true,
			success : didGetDoctors
		});
	}
}

function didGetDoctors(result, passthrough) {
	Alloy.Collections.doctors.reset(result.data.doctors);
	$.http.request({
		method : "prescriptions_list",
		params : {
			feature_code : "THXXX",
			data : [{
				prescriptions : {
					sort_order_preferences : apiCodes.prescriptions_sort_by_name,
					prescription_display_status : apiCodes.prescription_display_status_active
				}
			}]
		},
		success : didGetPrescriptions
	});
}

function didGetPrescriptions(result, passthrough) {
	rows = [];
	headerBtnDict.callback = didClickAdd;
	var section = $.uihelper.createTableViewSection($, $.strings.doctorsSectionDoctors, null, false, false, headerBtnDict),
	    prescriptions = result.data.prescriptions;
	Alloy.Collections.doctors.each(function(model) {
		var docPrescs = _.where(prescriptions, {
			doctor_id : model.get("id")
		});
		/* Description format
		 * 0 drugs You have no active prescriptions associated
		 * 1 drug has prescribed you [DRUGNAME].
		 * 2 drugs has prescribed you [DRUGNAME] and [DRUGNAME].
		 * 3 drugs has prescribed you [DRUGNAME], [DRUGNAME] and [DRUGNAME].
		 * 4 or more has prescribed you [DRUGNAME], [DRUGNAME], and [X] more.
		 */
		var len = docPrescs.length,
		    subtitle;
		if (len) {
			//When len is > 0
			subtitle = $.utilities.ucword(docPrescs[0].presc_name);
			if (len > 1) {
				//when > 1 and switch case used for defining when it is == 2, ==3 and > 3
				switch(len) {
				case 2:
					subtitle += " " + $.strings.strAnd + " " + $.utilities.ucword(docPrescs[1].presc_name);
					break;
				case 3:
					subtitle += ", " + $.utilities.ucword(docPrescs[1].presc_name) + " " + $.strings.strAnd + " " + $.utilities.ucword(docPrescs[2].presc_name);
					break;
				default:
					subtitle += ", " + $.utilities.ucword(prescriptions[1].presc_name) + " " + $.strings.strAnd + " [" + (len - 2) + "] " + $.strings.strMore;
				}
			}
			subtitle = String.format($.strings.doctorsLblPrescribed, subtitle);
		} else {
			subtitle = $.strings.doctorsLblPrescribedNone;
		}
		model.set({
			leftImage : model.get("image_url"),
			title : $.strings.strPrefixDoctor.concat($.utilities.ucword(model.get("first_name") || "") + " " + $.utilities.ucword(model.get("last_name") || "")),
			subtitle : subtitle,
			titleClasses : titleClasses,
			subtitleClasses : subtitleClasses,
			prescriptions : docPrescs,
			options : swipeOptions
		});
		var row = Alloy.createController("itemTemplates/contentViewSwipeable", model.toJSON());
		row.on("clickoption", didClickSwipeOption);
		section.add(row.getView());
		rows.push(row);
	});
	$.tableView.setData([section]);
}

function didClickSwipeOption(e) {
	if (Alloy.Globals.currentRow) {
		Alloy.Globals.currentRow.touchEnd();
	}
	/**
	 * we have only one option now, so no need for any further validation
	 * just confirm and remove doctor
	 */
	$.uihelper.showDialog({
		message : String.format($.strings.doctorsMsgRemoveConfirm, e.data.title),
		buttonNames : [$.strings.dialogBtnYes, $.strings.dialogBtnNo],
		cancelIndex : 1,
		success : function() {
			var data = e.data;
			$.http.request({
				method : "doctors_remove",
				params : {
					feature_code : "THXXX",
					data : [{
						doctors : {
							id : data.id
						}
					}]
				},
				passthrough : data,
				success : didRemoveDoctor
			});
		}
	});
}

function didRemoveDoctor(result, passthrough) {
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

function didClickAdd(e) {

}

function didClickTableView(e) {
	if (Alloy.Globals.currentRow) {
		return Alloy.Globals.currentRow.touchEnd();
	}
}

function terminate() {
	/**
	 * reset only when required
	 * only when it is a list screen not selectable
	 */
	Alloy.Globals.currentRow = null;
	Alloy.Globals.isSwipeInProgress = false;
}

exports.init = init;
exports.focus = focus;
exports.terminate = terminate;
