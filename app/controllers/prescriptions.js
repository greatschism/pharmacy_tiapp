var args = arguments[0] || {},
    app = require("core"),
    utilities = require("utilities"),
    http = require("requestwrapper"),
    uihelper = require("uihelper"),
    moment = require("alloy/moment"),
    dialog = require("dialog"),
    RX_NUMBER_PREFIX = Alloy.CFG.RX_NUMBER_PREFIX,
    PRESCRIPTION_AUTO_HIDE_AT = Alloy.CFG.PRESCRIPTION_AUTO_HIDE_AT,
    PRESCRIPTION_TOOLTIP_REMINDER_AT = Alloy.CFG.PRESCRIPTION_TOOLTIP_REMINDER_AT,
    PRESCRIPTION_CRITICAL_REMINDER_AT = Alloy.CFG.PRESCRIPTION_CRITICAL_REMINDER_AT,
    apiCodes = Alloy.CFG.apiCodes,
    icons = Alloy.CFG.icons,
    strings = Alloy.Globals.strings,
    sectionIds = ["gettingRefilled", "readyForPickup", "readyForRefill", "otherPrescriptions"],
    sections = {},
    rows = [],
    currentDate = moment(),
    overDueInfoStyle = $.createStyle({
	classes : ["right", "list-item-critical-info-lbl", "text-right"]
}),
    overDueDetailStyle = $.createStyle({
	classes : ["right", "list-item-critical-detail-lbl", "text-right"]
}),
    tooltipStyle = $.createStyle({
	classes : ["padding-top", "padding-bottom", "padding-right", "show", "arrow-left", "tooltip"],
	width : 150
}),
    criticalTooltipStyle = $.createStyle({
	classes : ["padding-top", "padding-bottom", "padding-right", "show", "arrow-left", "critical-tooltip"],
	width : 150
}),

    tooltipLblStyle = $.createStyle({
	classes : ["tooltip-lbl"]
});

function init() {
	http.request({
		method : "PRESCRIPTIONS_LIST",
		success : didGetPrescriptionList
	});
}

function didGetPrescriptionList(_result, _passthrough) {
	if (rows.length) {
		resetTable();
		rows = [];
	}
	//process data from server
	_result.data.prescriptions = _.sortBy(_result.data.prescriptions, function(obj) {
		return -parseInt(obj.is_overdue);
	});
	_.map(_result.data.prescriptions, function(prescription) {
		var status = prescription.refill_status,
		    refillDate = moment(prescription.anticipated_refill_date, apiCodes.DATE_FORMAT);
		prescription.is_overdue = parseInt(prescription.is_overdue);
		prescription.refill_in_days = Math.abs(currentDate.diff(refillDate, "days"));
		prescription.rx_number_formated = RX_NUMBER_PREFIX.concat(prescription.rx_number);
		switch(status) {
		case apiCodes.PRESCRIPTION_GETTING_REFILLED:
			var refillRequestDate = moment(prescription.latest_refill_requested_date, apiCodes.DATE_FORMAT),
			    promisedDate = moment(prescription.latest_refill_promised_date, apiCodes.DATE_FORMAT),
			    timeSpent = currentDate.diff(refillRequestDate, "seconds"),
			    timeTake = promisedDate.diff(refillRequestDate, "seconds");
			prescription.progress = Math.floor((timeSpent / timeTake) * 100) + "%";
			prescription.info = String.format(strings.msgOrderPlacedReadyBy, refillDate.format("dddd"));
			prescription.property = "gettingRefilled";
			break;
		case apiCodes.PRESCRIPTION_READY_FOR_PICKUP:
			prescription.days_after_promised_date = currentDate.diff(moment(prescription.latest_refill_promised_date, apiCodes.DATE_FORMAT), "days");
			prescription.days_remaining_for_pickup = prescription.restockperiod - prescription.days_after_promised_date;
			if (prescription.days_remaining_for_pickup <= PRESCRIPTION_TOOLTIP_REMINDER_AT) {
				tooltipLblStyle.html = String.format(strings.msgPickup, prescription.days_remaining_for_pickup);
				prescription.tooltip_style = prescription.days_remaining_for_pickup <= PRESCRIPTION_CRITICAL_REMINDER_AT ? criticalTooltipStyle : tooltipStyle;
				prescription.tooltip_lbl_style = tooltipLblStyle;
			}
			prescription.info = strings.msgYourOrderIsReady;
			prescription.property = "readyForPickup";
			break;
		case apiCodes.PRESCRIPTION_READY_FOR_REFILL:
			if (prescription.is_overdue) {
				prescription.info_style = overDueInfoStyle;
				prescription.detail_style = overDueDetailStyle;
			}
			prescription.autoHide = prescription.refill_in_days >= PRESCRIPTION_AUTO_HIDE_AT;
			prescription.info = prescription.is_overdue ? strings.msgOverdueBy : strings.msgDueFoRefillIn;
			prescription.detail = prescription.refill_in_days + " " + (prescription.refill_in_days == 1 ? strings.strDay : strings.strDays);
			prescription.property = "readyForRefill";
			break;
		case apiCodes.PRESCRIPTION_OTHERS:
			prescription.info = strings.msgDueFoRefillOn;
			prescription.detail = refillDate.format(Alloy.CFG.DATE_FORMAT);
			prescription.property = "otherPrescriptions";
			break;
		}
		if (!sections[prescription.property]) {
			sections[prescription.property] = uihelper.createTableViewSection($, strings["section".concat(utilities.ucfirst(prescription.property, false))]);
		}
		var row = Alloy.createController("itemTemplates/".concat(prescription.property), prescription).getView();
		sections[prescription.property].add(row);
		rows.push(row);
	});
	updateTable();
	Alloy.Collections.prescriptions.reset(_result.data.prescriptions);
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

function updateTable() {
	//add valid sections to table
	var data = [];
	_.each(sectionIds, function(sectionId) {
		var section = sections[sectionId];
		if (section && section.rows.length) {
			data.push(section);
		}
	});
	$.tableView.setData(data, {
		animated : true
	});
}

function didChangeSearch(e) {
	resetTable();
	var searchBy = ($.searchbar.getValue()).toLowerCase();
	//add rows those which passes search key
	_.each(rows, function(row) {
		if (row.searchableText.indexOf(searchBy) >= 0) {
			sections[row.sectionId].add(row);
		}
	});
	updateTable();
}

function didItemClick(e) {

}

function didClickOptionView(e) {

	var menuItems = [
		 Alloy.Globals.strings.menuSearch,
		Alloy.Globals.strings.menuSort,

		Alloy.Globals.strings.menuUnhidePrescriptions,
		Alloy.Globals.strings.menuRefresh,
];
		$.optionsMenu.options=menuItems;
		$.optionsMenu.show();
		$.optionsMenu.addEventListener('click',function(e)
            {
  	  switch(e.index) {
		case 0:
		toggleSearchView();
		break;
		case 1:
		sort();
		break;
		case 2:
		alert("Unhide under construction");
		break;
		case 3:
		init();
		break;
	}
            	
            });
}

function doClickOptionDialog(e) {

	alert(e.index);
}

function didClickOptionMenu(e) {
	var action = e.data.action;
	switch(action) {
	case "search":
		toggleSearchView();
		break;
	case "sort":
		sort();
		break;
	case "refresh":
		init();
		break;
	}
}

function toggleSearchView() {
	var tableTop = 0;
	if ($.tableView.top == tableTop) {
		tableTop = $.searchView.size.height;
		$.searchView.opacity = 1;
	} else {
		var svAnimation = Ti.UI.createAnimation({
			opacity : 0,
			duration : 200
		});
		svAnimation.addEventListener("complete", function onComplete() {
			$.searchView.opacity = 0;
		});
		$.searchView.animate(svAnimation);
	}
	var tbAnimation = Ti.UI.createAnimation({
		top : tableTop,
		duration : 200
	});
	tbAnimation.addEventListener("complete", function onComplete() {
		$.tableView.top = tableTop;
		if (tableTop != 0) {
			$.searchbar.focus();
		}
	});
	$.tableView.animate(tbAnimation);
}

function sort() {
	if (!Alloy.Collections.sortPreferences.length) {
		getSortPreferences();
	}
	$.sortPicker.show();
}

function getSortPreferences() {
	http.request({
		method : "CODE_VALUES_GET",
		success : updateSortPreferences
	});
}

function updateSortPreferences(_result) {
	Alloy.Collections.sortPreferences.reset(_result.data.code_values);
	$.sortPicker.setItems(Alloy.Collections.sortPreferences.toJSON());
	sort();
}

function didClickSortPicker(e) {
	console.log(e.data);
}

function didClickUnhideBtn(e) {
	$.unhidePicker.hide();
}

function didClickCloseBtn(e) {
	$.unhidePicker.hide();
}

function didClickSelectNone(e) {
	$.unhidePicker.setSelection({}, false);
}

function didClickSelectAll(e) {
	$.unhidePicker.setSelection({}, true);
}

function didAndroidBack() {
	return $.optionsMenu.hide();
}

exports.init = init;
exports.androidback = didAndroidBack;
