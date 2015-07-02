var args = arguments[0] || {},
    moment = require("alloy/moment"),
    apiCodes = Alloy.CFG.apiCodes,
    strings = Alloy.Globals.strings,
    swipeOptions = [{
	action : 1,
	title : strings.lblHideFromList
}, {
	action : 2,
	title : strings.strRefillNow,
	type : "positive"
}],
    sections;

function init() {
	Alloy.Globals.currentTable = $.tableView;
	var codes = Alloy.Models.sortOrderPreferences.get("code_values");
	if (codes) {
		$.sortPicker.setItems(codes);
		getPrescriptionList();
	} else {
		getSortOrderPreferences();
	}
}

function getSortOrderPreferences() {
	$.http.request({
		method : "codes_get",
		params : {
			feature_code : "THXXX",
			data : [{
				codes : [{
					code_name : apiCodes.code_sort_order_preference
				}]
			}]
		},
		keepLoader : true,
		success : didGetSortOrderPreferences
	});
}

function didGetSortOrderPreferences(result) {
	Alloy.Models.sortOrderPreferences.set(result.data.codes[0]);
	var codes = Alloy.Models.sortOrderPreferences.get("code_values"),
	    defaultVal = Alloy.Models.sortOrderPreferences.get("default_value");
	_.each(codes, function(code) {
		if (code.code_value === defaultVal) {
			Alloy.Models.sortOrderPreferences.set("selected_code_value", defaultVal);
			code.selected = true;
		} else {
			code.selected = false;
		}
	});
	$.sortPicker.setItems(codes);
	getPrescriptionList();
}

function getPrescriptionList() {
	$.searchTxt.setValue("");
	$.http.request({
		method : "prescriptions_list",
		params : {
			feature_code : "THXXX",
			data : [{
				prescriptions : {
					sort_order_preferences : Alloy.Models.sortOrderPreferences.get("selected_code_value"),
					prescription_display_status : apiCodes.prescription_display_status_active
				}
			}]
		},
		success : didGetPrescriptionList
	});
}

function didGetPrescriptionList(result, passthrough) {
	//process data from server
	Alloy.Collections.prescriptions.reset(result.data.prescriptions);
	//loop data for rows
	var currentDate = moment(),
	    filters = {
		readyForPickup : "",
		gettingRefilled : "",
		readyForRefill : "",
		otherPrescriptions : ""
	};
	sections = {
		readyForPickup : [],
		gettingRefilled : [],
		readyForRefill : [],
		otherPrescriptions : []
	};
	var statuses = (args.filter || {}).refill_status || [],
	    ids = (args.filter || {}).ids || [];
	Alloy.Collections.prescriptions.each(function(prescription) {
		/**
		 *	Exclude refill_status that are not present in filter
		 * 	Exclude id that is present in filter
		 */
		if (_.has(args, "filter") && (_.indexOf(statuses, prescription.get("refill_status")) == -1 || _.indexOf(ids, prescription.get("id")) != -1)) {
			return false;
		}
		prescription.set("title", $.utilities.ucword(prescription.get("presc_name")));
		switch(prescription.get("refill_status")) {
		case apiCodes.refill_status_in_process:
			var requestedDate = prescription.get("latest_refill_requested_date") ? moment(prescription.get("latest_refill_requested_date"), apiCodes.date_time_format) : currentDate,
			    progress = 0,
			    subtitle;
			if (prescription.get("latest_refill_promised_date")) {
				var promisedDate = moment(prescription.get("latest_refill_promised_date"), apiCodes.date_time_format),
				    totalTime = promisedDate.diff(requestedDate, "seconds", true),
				    timeSpent = currentDate.diff(requestedDate, "seconds", true);
				subtitle = String.format(strings.msgOrderPlacedReadyBy, promisedDate.format(Alloy.CFG.date_time_format));
				progress = Math.floor((timeSpent / totalTime) * 100);
			} else {
				subtitle = strings.strRxPrefix.concat(prescription.get("rx_number"));
				progress = currentDate.diff(requestedDate, "hours", true) > Alloy.CFG.prescription_progress_x_hours ? Alloy.CFG.prescription_progress_after_x_hours : Alloy.CFG.prescription_progress_before_x_hours;
			}
			prescription.set({
				subtitle : subtitle,
				progress : progress,
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
						tooltip : String.format(strings.msgPickup, daysLeft),
						tooltipType : daysLeft <= Alloy.CFG.prescription_negative_tooltip_reminder_in_days ? "negative" : null
					});
				}
			}
			prescription.set({
				subtitle : strings.sectionReadyForPickup,
				section : "readyForPickup",
				itemTemplate : "completed"
			});
			break;
		default:
			var dueInDays = 0,
			    section = "otherPrescriptions";
			if (prescription.get("anticipated_refill_date")) {
				var anticipatedRefillDate = moment(prescription.get("anticipated_refill_date"), apiCodes.date_format);
				dueInDays = anticipatedRefillDate.diff(currentDate, "days");
				if (dueInDays <= Alloy.CFG.prescription_ready_for_refill_in_days) {
					section = "readyForRefill";
					prescription.set("detailType", dueInDays < 0 ? "negative" : "");
					var dueInDaysAbs = Math.abs(dueInDays);
					if (dueInDays <= Alloy.CFG.prescription_auto_hide_in_days) {
						prescription.set({
							detailTitle : strings.msgOverdueBy + " " + dueInDaysAbs + " " + strings.strDays,
							detailSubtitle : strings.lblSwipeLeftToHide,
							masterWidth : 55,
							detailWidth : 45
						});
					} else {
						prescription.set({
							detailTitle : strings[dueInDays < 0 ? "msgOverdueBy" : "msgRefillIn"],
							detailSubtitle : dueInDaysAbs + " " + strings[dueInDaysAbs > 1 ? "strDays" : "strDay"]
						});
					}
				} else {
					prescription.set({
						detailTitle : strings.msgDueOn,
						detailSubtitle : anticipatedRefillDate.format(Alloy.CFG.date_format)
					});
				}
			} else {
				prescription.set({
					masterWidth : 100,
					detailWidth : 0
				});
			}
			prescription.set({
				section : section,
				due_in_days : dueInDays,
				subtitle : strings.strRxPrefix.concat(prescription.get("rx_number")),
				itemTemplate : args.selectable ? "masterDetailSelectable" : "masterDetailSwipeable",
				options : swipeOptions
			});
		}
		var sectionId = prescription.get("section"),
		    itemTemplate = prescription.get("itemTemplate"),
		    filterText = _.values(_.pick(prescription.toJSON(), ["title", "subtitle", "detailTitle", "detailSubtitle"])).join(" ").toLowerCase();
		prescription.set("filterText", filterText);
		filters[sectionId] += filterText;
		var row = Alloy.createController("itemTemplates/".concat(itemTemplate), prescription.toJSON());
		switch(itemTemplate) {
		case "masterDetailSwipeable":
			row.on("clickoption", didClickoption);
			break;
		}
		sections[sectionId].push(row);
	});
	var data = [];
	_.each(sections, function(rows, name) {
		if (rows.length) {
			var tvSection = $.uihelper.createTableViewSection($, strings["section".concat($.utilities.ucfirst(name, false))], filters[name]);
			_.each(rows, function(row) {
				tvSection.add(row.getView());
			});
			data.push(tvSection);
		}
	});
	$.tableView.setData(data);
}

function didChangeSearch(e) {
	$.tableView.filterText = $.searchTxt.getValue();
}

function didClickRightNavBtn(e) {
	if ($.sortPicker.getVisible()) {
		return $.sortPicker.hide();
	}
	$.optionsMenu.show();
}

function didClickOptionMenu(e) {
	switch(e.index) {
	case 0:
		toggleSearch();
		break;
	case 1:
		$.sortPicker.show();
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

function didClickSortPicker(e) {
	Alloy.Models.sortOrderPreferences.set("selected_code_value", e.data.code_value);
	getPrescriptionList();
}

function didClickSortClose(e) {
	$.sortPicker.hide();
}

function didClickoption(e) {
	Alloy.Globals.currentRow.touchEnd();
}

function didClickTableView(e) {
	if (Alloy.Globals.currentRow) {
		return Alloy.Globals.currentRow.touchEnd();
	}
	var index = e.index,
	    count = 0,
	    row;
	_.each(sections, function(section) {
		count += section.length;
		if (!row && count > index) {
			row = section[index - (count - section.length)];
		}
	});
	if (row) {
		var rargs = row.getParams();
		$.app.navigator.open({
			title : rargs.title,
			ctrl : "prescriptionDetails",
			ctrlArguments : rargs,
			stack : true
		});
	}
}

function terminate() {
	Alloy.Globals.currentRow = null;
	Alloy.Globals.currentTable = null;
	Alloy.Globals.swipeInProgress = false;
}

exports.init = init;
exports.terminate = terminate;
