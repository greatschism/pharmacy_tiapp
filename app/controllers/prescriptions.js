var args = arguments[0] || {},
    moment = require("alloy/moment"),
    apiCodes = Alloy.CFG.apiCodes,
    swipeOptions,
    sections,
    currentPrescription;

function init() {
	$.vDividerView.height = $.uihelper.getHeightFromChildren($.unhideHeaderView);
	swipeOptions = [{
		action : 1,
		title : $.strings.prescSwipeOptHide
	}, {
		action : 2,
		title : $.strings.prescSwipeOptRefill,
		type : "positive"
	}];
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

function getPrescriptionList(status, callback) {
	//reset search if any
	if ($.searchTxt.getValue()) {
		$.searchTxt.setValue("");
		$.tableView.filterText = "";
	}
	//get data
	$.http.request({
		method : "prescriptions_list",
		params : {
			feature_code : "THXXX",
			data : [{
				prescriptions : {
					sort_order_preferences : Alloy.Models.sortOrderPreferences.get("selected_code_value"),
					prescription_display_status : status || apiCodes.prescription_display_status_active
				}
			}]
		},
		success : callback || didGetPrescriptionList,
		failure : callback || didGetPrescriptionList
	});
}

function didGetPrescriptionList(result, passthrough) {
	/**
	 * check whether it is a success call
	 * since no prescriptions found is considered as a error and data is null
	 * set prescriptions node to empty array in order to reset the list view
	 */
	if (!result.data) {
		//ignore when list is already empty
		if (!Alloy.Collections.prescriptions.length) {
			return false;
		}
		//this resets the list populated already
		result.data = {
			prescriptions : []
		};
	}
	//process data from server
	Alloy.Collections.prescriptions.reset(result.data.prescriptions);
	//reset section / row data
	sections = {
		readyPickup : [],
		inProgress : [],
		readyRefill : [],
		others : []
	};
	//loop data for rows
	var sectionHeaders = {
		readyPickup : "",
		inProgress : "",
		readyRefill : "",
		others : ""
	},
	    currentDate = moment(),
	    filters = (args.filters || {});
	/**
	 * we keep all the returned prescriptions in collection
	 * filters are applied to determine whether it has to be displayed on screen
	 * still the prescription object that doesn't pass the filter validation will be available in the collection
	 */
	Alloy.Collections.prescriptions.each(function(prescription) {
		/**
		 *	exclude anything that matches with filter
		 *  example
		 * 		filters:{
		 * 			id: [1,2],
		 * 			refill_status: ["Ready","In Process"]
		 * 		}
		 */
		var proceed = true;
		_.each(filters, function(filter, key) {
			if (_.indexOf(filter, prescription.get(key)) !== -1) {
				proceed = false;
			}
		});
		if (!proceed) {
			return false;
		}
		/**
		 * If the user don't pick up the prescription after the restock period, DAYS_TO_RESTOCK – (TODAY_DATE - LAST_FILLED_DATE)
		 * then it is returned to the "Ready for refill" list.
		 */
		var daysLeft;
		if (prescription.get("refill_status") == apiCodes.refill_status_ready) {
			daysLeft = Alloy.Models.appload.get("restocking_period") - currentDate.diff(moment(prescription.get("presc_last_filled_date"), apiCodes.date_time_format), "days");
			if (daysLeft < 0) {
				/**
				 * update the status from Ready to Sold
				 * as mentioned above
				 *  */
				prescription.set("refill_status", apiCodes.refill_status_sold);
			}
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
				subtitle = String.format($.strings.prescInProgressLblPromise, promisedDate.format(Alloy.CFG.date_time_format));
				progress = Math.floor((timeSpent / totalTime) * 100);
			} else {
				subtitle = $.strings.strPrefixRx.concat(prescription.get("rx_number"));
				progress = currentDate.diff(requestedDate, "hours", true) > Alloy.CFG.prescription_progress_x_hours ? Alloy.CFG.prescription_progress_after_x_hours : Alloy.CFG.prescription_progress_before_x_hours;
			}
			prescription.set({
				canHide : false,
				subtitle : subtitle,
				progress : progress,
				section : "inProgress",
				itemTemplate : "inprogress"
			});
			break;
		case apiCodes.refill_status_ready:
			if (daysLeft <= Alloy.CFG.prescription_pickup_reminder) {
				prescription.set({
					tooltip : String.format($.strings[daysLeft === 0 ? "prescReadyPickupLblRestockToday" : "prescReadyPickupLblRestock"], daysLeft, $.strings[daysLeft > 1 ? "strDays" : "strDay"]),
					tooltipType : "negative"
				});
			}
			prescription.set({
				canHide : false,
				subtitle : $.strings.prescReadyPickupLblReady,
				section : "readyPickup",
				itemTemplate : "completed"
			});
			break;
		default:
			var dueInDays = 0,
			    section = "others",
			    template = args.selectable ? "masterDetailWithLIcon" : "masterDetailSwipeable";
			/**
			 * keep the swipe options out (masterDetailWithLIcon - is picked)
			 * when selectable is true
			 */
			if (prescription.get("anticipated_refill_date")) {
				/**
				 * if  anticipated_refill_date is <= Alloy.CFG.prescription_ready_for_refill - move to ready for refill
				 * */
				var anticipatedRefillDate = moment(prescription.get("anticipated_refill_date"), apiCodes.date_format);
				dueInDays = anticipatedRefillDate.diff(currentDate, "days");
				if (dueInDays <= Alloy.CFG.prescription_ready_for_refill) {
					section = "readyRefill";
					/**
					 * prevent any actions on list when selectable is true, use masterDetailWithLIcon only
					 * show auto hide button when anticipated_refill_date - current date  <= Alloy.CFG.prescription_auto_hide
					 */
					if (!args.selectable && dueInDays <= Alloy.CFG.prescription_auto_hide) {
						template = "masterDetailBtn";
						prescription.set({
							detailTitle : $.strings.prescReadyRefillBtnHide
						});
					} else {
						var dueInDaysAbs = Math.abs(dueInDays);
						//if over due use negative classes
						prescription.set({
							detailType : dueInDays < 0 ? "negative" : "",
							detailTitle : $.strings[dueInDays < 0 ? "prescReadyRefillLblOverdue" : "prescReadyRefillLblRefillIn"],
							detailSubtitle : dueInDaysAbs + " " + $.strings[dueInDaysAbs > 1 ? "strDays" : "strDay"]
						});
					}
				} else {
					prescription.set({
						detailTitle : $.strings.prescOthersLblDueOn,
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
				canHide : true,
				section : section,
				options : swipeOptions,
				itemTemplate : template,
				subtitle : $.strings.strPrefixRx.concat(prescription.get("rx_number"))
			});
		}
		var sectionId = prescription.get("section"),
		    itemTemplate = prescription.get("itemTemplate"),
		    filterText = _.values(_.pick(prescription.toJSON(), ["title", "subtitle", "detailTitle", "detailSubtitle"])).join(" ").toLowerCase();
		prescription.set("filterText", filterText);
		var row = Alloy.createController("itemTemplates/".concat(itemTemplate), prescription.toJSON());
		switch(itemTemplate) {
		case "masterDetailSwipeable":
			row.on("clickoption", didClickSwipeOption);
			break;
		case "masterDetailBtn":
			row.on("clickdetail", hidePrescription);
			break;
		}
		sectionHeaders[sectionId] += filterText;
		sections[sectionId].push(row);
	});
	var data = [];
	_.each(sections, function(rows, key) {
		if (rows.length) {
			var tvSection;
			/**
			 * others section - will be the last section in sections list, if data length == 0
			 * the section header should be ignored for the same
			 */
			if (key == "others" && data.length === 0) {
				tvSection = Ti.UI.createTableViewSection();
			} else {
				tvSection = $.uihelper.createTableViewSection($, $.strings["prescSection".concat($.utilities.ucfirst(key, false))], sectionHeaders[key]);
			}
			_.each(rows, function(row) {
				tvSection.add(row.getView());
			});
			data.push(tvSection);
		}
	});
	$.tableView.setData(data);
	/*
	 *  reset the swipe flag
	 *  once a fresh list is loaded
	 *  not resetting this block further swipe actions
	 */
	Alloy.Globals.isSwipeInProgress = false;
	Alloy.Globals.currentRow = null;
}

function didChangeSearch(e) {
	$.tableView.filterText = $.searchTxt.getValue();
}

function didClickRightNavBtn(e) {
	if (!hideAllPopups()) {
		$.optionsMenu.show();
	}
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
		getPrescriptionList();
		break;
	case 3:
		getPrescriptionList(apiCodes.prescription_display_status_hideen, didGetHiddenPrescriptions);
		break;
	}
}

function toggleSearch() {
	var top = 0,
	    opacity = 0;
	if ($.tableView.top == top) {
		opacity = 1;
		top = $.searchbar.size.height;
		$.searchbar.visible = true;
	}
	var sAnim = Ti.UI.createAnimation({
		opacity : opacity,
		duration : 200
	});
	sAnim.addEventListener("complete", function onComplete() {
		sAnim.removeEventListener("complete", onComplete);
		$.searchbar.opacity = opacity;
		if (!opacity) {
			$.searchbar.visible = false;
		}
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

function didGetHiddenPrescriptions(result, passthrough) {
	/**
	 * same callback is used for both success and failure
	 * ignore when data is null
	 */
	if (!result.data) {
		return false;
	}
	/**
	 * wrap required properties to prescription object
	 */
	var hPrescriptions = result.data.prescriptions;
	_.each(hPrescriptions, function(prescription) {
		_.extend(prescription, {
			masterWidth : 100,
			detailWidth : 0,
			title : $.utilities.ucword(prescription.presc_name),
			subtitle : $.strings.strPrefixRx.concat(prescription.rx_number)
		});
	});
	$.unhidePicker.setItems(hPrescriptions);
	$.unhidePicker.show();
}

function toggleUnhideSelection(e) {
	$.unhidePicker.setSelectedItems({}, e.source == $.selectAllBtn);
}

function didClickUnhide(e) {
	$.unhidePicker.hide();
	var prescriptions = [];
	_.each($.unhidePicker.getSelectedItems(), function(item) {
		prescriptions.push({
			id : item.id
		});
	});
	if (prescriptions.length) {
		$.http.request({
			method : "prescriptions_unhide",
			params : {
				feature_code : "THXXX",
				data : [{
					prescriptions : prescriptions
				}]
			},
			keepLoader : true,
			success : function() {
				//refresh list
				getPrescriptionList();
			}
		});
	}
}

function didClickUnhideClose(e) {
	$.unhidePicker.hide();
}

function didClickSortPicker(e) {
	Alloy.Models.sortOrderPreferences.set("selected_code_value", e.data.code_value);
	getPrescriptionList();
}

function didClickSortClose(e) {
	$.sortPicker.hide();
}

function didClickSwipeOption(e) {
	if (Alloy.Globals.currentRow) {
		Alloy.Globals.currentRow.touchEnd();
	}
	switch (e.action) {
	case 1:
		hidePrescription(e);
		break;
	case 2:
		$.app.navigator.open({
			titleid : "titleOrderDetails",
			ctrl : "orderDetails",
			ctrlArguments : {
				prescriptions : [e.data]
			},
			stack : true
		});
		break;
	}
}

function hidePrescription(e) {
	$.http.request({
		method : "prescriptions_hide",
		params : {
			feature_code : "THXXX",
			data : [{
				prescriptions : [{
					id : e.data.id
				}]
			}]
		},
		keepLoader : true,
		success : function() {
			//refresh list
			getPrescriptionList();
		}
	});
}

function didClickTableView(e) {
	if (Alloy.Globals.currentRow) {
		return Alloy.Globals.currentRow.touchEnd();
	}
	var index = e.index,
	    count = 0,
	    row;
	_.each(sections, function(rows) {
		count += rows.length;
		if (!row && count > index) {
			row = rows[index - (count - rows.length)];
		}
	});
	if (row) {
		currentPrescription = row.getParams();
		$.app.navigator.open({
			titleid : "titlePrescriptionDetails",
			ctrl : "prescriptionDetails",
			ctrlArguments : {
				prescription : currentPrescription,
				canHide : currentPrescription.canHide
			},
			stack : true
		});
	}
}

function hideAllPopups() {
	if ($.sortPicker.getVisible()) {
		return $.sortPicker.hide();
	}
	if ($.unhidePicker.getVisible()) {
		return $.unhidePicker.hide();
	}
	return false;
}

function focus() {
	if (currentPrescription && currentPrescription.hidden) {
		currentPrescription = null;
		getPrescriptionList();
	}
}

function terminate() {
	Alloy.Globals.currentRow = null;
	Alloy.Globals.currentTable = null;
	Alloy.Globals.isSwipeInProgress = false;
}

exports.init = init;
exports.focus = focus;
exports.terminate = terminate;
exports.backButtonHandler = hideAllPopups;
