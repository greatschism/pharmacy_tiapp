var args = arguments[0] || {},
    moment = require("alloy/moment"),
    currentDate = moment(),
    apiCodes = Alloy.CFG.apiCodes,
    sectionIds = ["readyForPickup", "gettingRefilled", "readyForRefill", "otherPrescriptions"],
    sections = {},
    rows = [];

function init() {
	$.http.request({
		method : "prescriptions_list",
		params : {
			data : [{
				prescriptions : {
					sort_order_preferences : (_.findWhere(Alloy.Collections.sortPreferences.toJSON(), {
						selected : true
					}) || {}).code_value || null,
					prescription_display_status : apiCodes.prescription_display_status_active
				}
			}]
		},
		success : didGetPrescriptionList
	});
}

function didGetPrescriptionList(result, passthrough) {
	//reset table and rows
	if (rows.length) {
		resetTable();
		rows = [];
	}
	//process data from server
	Alloy.Collections.prescriptions.reset(_.sortBy(result.data.prescriptions, function(obj) {
		return -parseInt(obj.is_overdue);
	}));
	//loop data for rows
	Alloy.Collections.prescriptions.map(function(prescription) {

	});
}

function resetTable() {
	//remove all sections from table
	$.tableView.setData([], {
		animated : true
	});
	//remove all rows from sections
	_.each(sectionIds, function(sectionId) {
		var section = sections[sectionId];
		if (section) {
			var srows = section.rows;
			_.each(srows, function(srow) {
				section.remove(srow);
			});
		}
	});
}

function didClickRightNavBtn(e) {
	$.optionsMenu.show();
}

function didClickOptionMenu(e) {
	switch(e.index) {
	case 0:
		toggleSearch();
		break;
	case 1:
		//sort;
		break;
	case 2:
		//unhide;
		break;
	case 3:
		//refresh
		break;
	}
}

function toggleSearch() {
	var top = 0,
	    opacity = 0;
	if ($.tableView.top == top) {
		top = $.searchbar.size.height;
		opacity = 1;
	}
	var sAnim = Ti.UI.createAnimation({
		opacity : opacity,
		duration : 200
	});
	sAnim.addEventListener("complete", function onComplete() {
		sAnim.removeEventListener("complete", onComplete);
		$.searchbar.opacity = opacity;
	});
	$.searchbar.animate(sAnim);
	var tAnim = Ti.UI.createAnimation({
		top : top,
		duration : 200
	});
	tAnim.addEventListener("complete", function onComplete() {
		tAnim.removeEventListener("complete", onComplete);
		$.tableView.top = top;
		if (top !== 0) {
			$.searchTxt.focus();
		}
	});
	$.tableView.animate(tAnim);
}

function terminate() {

}

exports.init = init;
exports.terminate = terminate;
