var args = arguments[0] || {},
    moment = require("alloy/moment"),
    apiCodes = Alloy.CFG.apiCodes,
    sectionIds = ["readyForPickup", "gettingRefilled", "readyForRefill", "otherPrescriptions"],
    sections = {},
    rows = [],
    swipeOptions = [{
	action : 1,
	title : Alloy.Globals.strings.lblHideFromList
}, {
	action : 2,
	title : Alloy.Globals.strings.strRefillNow,
	type : "positive"
}];

//temp session_id for development
Alloy.Models.patient.set("session_id", "4JBSv4ViJYiBiNwHYYiJY4VicYABYHvS");

function init() {
	Alloy.Globals.swipeableTable = $.tableView;
	var codes = Alloy.Models.sortOrderPreferences.get("code_values");
	if (codes) {
		$.sortPicker.setItems(codes);
	}
	getPrescriptionList();
}

function getPrescriptionList() {
	$.searchTxt.setValue("");
	$.http.request({
		method : "prescriptions_list",
		params : {
			data : [{
				prescriptions : {
					sort_order_preferences : (_.findWhere(Alloy.Models.sortOrderPreferences.get("code_values"), {
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
	//reset sections and rows
	if (rows.length) {
		resetTable();
		rows = [];
	}
	//process data from server
	Alloy.Collections.prescriptions.reset(result.data.prescriptions);
	//loop data for rows
	var currentDate = moment();
	Alloy.Collections.prescriptions.each(function(prescription) {
		//process only status that are mentioned in filter if passed
		if (_.has(args, "filter") && _.indexOf(args.filter, prescription.get("refill_status")) == -1) {
			return false;
		}
		prescription.set("title", $.utilities.ucword(prescription.get("presc_name")));
		switch(prescription.get("refill_status")) {
		case apiCodes.refill_status_in_process:
			var requestedDate = prescription.get("latest_refill_requested_date") ? moment(prescription.get("latest_refill_requested_date"), apiCodes.date_time_format) : currentDate,
			    promisedDate = prescription.get("latest_refill_promised_date") ? moment(prescription.get("latest_refill_promised_date"), apiCodes.date_time_format) : currentDate,
			    totalTime = promisedDate.diff(requestedDate, "seconds", true),
			    timeSpent = currentDate.diff(requestedDate, "seconds", true);
			prescription.set({
				subtitle : String.format(Alloy.Globals.strings.msgOrderPlacedReadyBy, prescription.get("latest_refill_promised_date") ? promisedDate.format(Alloy.CFG.date_time_format) : Alloy.Globals.strings.strNotApplicable),
				progress : Math.floor((timeSpent / totalTime) * 100),
				section : "gettingRefilled",
				itemTemplate : "inprogress"
			});
			break;
		case apiCodes.refill_status_ready:
			if (prescription.get("expiration_date")) {
				var expirationDate = moment(prescription.get("expiration_date"), apiCodes.date_format),
				    daysLeft = expirationDate.diff(currentDate, "days");
				if (daysLeft > 0 && daysLeft <= Alloy.CFG.prescription_tooltip_reminder_in_days) {
					prescription.set({
						tooltip : String.format(Alloy.Globals.strings.msgPickup, daysLeft),
						tooltipType : daysLeft <= Alloy.CFG.prescription_negative_tooltip_reminder_in_days ? "negative" : null
					});
				}
			}
			prescription.set({
				subtitle : Alloy.Globals.strings.sectionReadyForPickup,
				section : "readyForPickup",
				itemTemplate : "completed"
			});
			break;
		default:
			var isAnticipatedRefillDate = prescription.get("anticipated_refill_date") !== "",
			    anticipatedRefillDate = isAnticipatedRefillDate ? moment(prescription.get("anticipated_refill_date"), apiCodes.date_format) : null,
			    dueInDays = isAnticipatedRefillDate ? anticipatedRefillDate.diff(currentDate, "days") : 0,
			    section = isAnticipatedRefillDate && dueInDays <= Alloy.CFG.prescription_ready_for_refill_in_days ? "readyForRefill" : "otherPrescriptions";
			prescription.set({
				due_in_days : dueInDays,
				subtitle : Alloy.CFG.rx_number.prefix.concat(prescription.get("rx_number")),
				section : section,
				itemTemplate : !args.orgin ? "masterDetailSwipeable" : "masterDetail"
			});
			if (section == "readyForRefill") {
				prescription.set({
					detailType : dueInDays < 0 ? "negative" : "",
					options : args.orgin ? [] : swipeOptions
				});
				var dueInDaysAbs = Math.abs(dueInDays);
				if (dueInDays <= Alloy.CFG.prescription_auto_hide_in_days) {
					prescription.set({
						detailTitle : Alloy.Globals.strings.msgOverdueBy + " " + dueInDaysAbs + " " + Alloy.Globals.strings.strDays,
						detailSubtitle : Alloy.Globals.strings.lblSwipeLeftToHide,
						masterWidth : 50,
						detailWidth : 50
					});
				} else {
					prescription.set({
						detailTitle : Alloy.Globals.strings[dueInDays < 0 ? "msgOverdueBy" : "msgRefillIn"],
						detailSubtitle : dueInDaysAbs + " " + Alloy.Globals.strings[dueInDaysAbs > 1 ? "strDays" : "strDay"],
					});
				}
			} else {
				prescription.set({
					detailTitle : Alloy.Globals.strings.msgDueOn,
					detailSubtitle : isAnticipatedRefillDate ? anticipatedRefillDate.format(Alloy.CFG.date_format) : Alloy.Globals.strings.strNotApplicable
				});
			}
		}
		prescription.set("searchableText", _.values(_.pick(prescription.toJSON(), ["title", "subtitle", "detailTitle", "detailSubtitle"])).join(" ").toLowerCase());
		var sectionId = prescription.get("section");
		if (!sections[sectionId]) {
			sections[sectionId] = $.uihelper.createTableViewSection($, Alloy.Globals.strings["section".concat($.utilities.ucfirst(sectionId, false))]);
		}
		var row = Alloy.createController("itemTemplates/".concat(prescription.get("itemTemplate")), prescription.toJSON());
		sections[sectionId].add(row.getView());
		rows.push(row);
	});
	updateTable();
}

function didChangeSearch(e) {
	resetTable();
	var searchBy = ($.searchTxt.getValue()).toLowerCase();
	//add rows those which passes search key
	_.each(rows, function(row) {
		var params = row.getParams();
		if (params.searchableText.indexOf(searchBy) >= 0) {
			sections[params.section].add(row.getView());
		}
	});
	updateTable();
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
		sort();
		break;
	case 2:
		//unhide;
		break;
	case 3:
		getPrescriptionList();
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

function didClickSortCancel(e) {
	$.sortPicker.hide();
}

function sort() {
	if (!Alloy.Models.sortOrderPreferences.get("code_values")) {
		return getSortOrderPreferences();
	}
	$.sortPicker.show();
}

function getSortOrderPreferences() {
	$.http.request({
		method : "codes_get",
		params : {
			data : [{
				codes : [{
					code_name : apiCodes.sort_order_preference
				}]
			}]
		},
		success : didGetSortOrderPreferences
	});
}

function didGetSortOrderPreferences(result) {
	Alloy.Models.sortOrderPreferences.set(result.data.codes[0]);
	var codes = Alloy.Models.sortOrderPreferences.get("code_values"),
	    defaultVal = Alloy.Models.sortOrderPreferences.get("default_value");
	_.each(codes, function(code) {
		code.selected = code.code_value === defaultVal;
	});
	$.sortPicker.setItems(codes);
	sort();
}

function terminate() {
	Alloy.Globals.isSwiped = false;
	Alloy.Globals.swipeableTable = null;
}

exports.init = init;
exports.terminate = terminate;
