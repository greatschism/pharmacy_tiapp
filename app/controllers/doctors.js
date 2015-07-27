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
		title : $.strings.doctorsSwipeOptDelete,
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
		model.set({
			leftImage : model.get("image_url"),
			title : $.strings.strPrefixDoctor.concat($.utilities.ucword(model.get("first_name") || "") + $.utilities.ucword(model.get("last_name") || "")),
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
	 * just confirm and delete doctor
	 */

}

function didClickAdd(e) {

}

function didClickTableView(e) {

}

exports.init = init;
exports.focus = focus;
