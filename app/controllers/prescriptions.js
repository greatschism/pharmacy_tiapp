var args = arguments[0] || {},
    moment = require("alloy/moment"),
    apiCodes = Alloy.CFG.apiCodes,
    headerBtnDict,
    detailBtnClasses,
    swipeOptions,
    sections,
    currentPrescription,
    isWindowOpen;

function init() {
	$.vDividerView.height = $.uihelper.getHeightFromChildren($.unhideHeaderView);
	if (args.selectable) {
		$.tableView.bottom = $.tableView.bottom + $.submitBtn.height + $.submitBtn.bottom;
		headerBtnDict = $.createStyle({
			classes : ["content-header-right-btn"],
			title : $.strings.prescAddSectionBtnAll
		});
	} else {
		detailBtnClasses = ["content-detail-secondary-btn"];
		swipeOptions = [{
			action : 1,
			title : $.strings.prescSwipeOptHide
		}, {
			action : 2,
			title : $.strings.prescSwipeOptRefill,
			type : "positive"
		}];
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
			Alloy.Models.sortOrderPreferences.set("selected_code_value", code.code_value);
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
	 * if it is a callback from request wrapper
	 * should have valid result / error object
	 * otherwise use the cached one -
	 * when add prescriptions from order details
	 */
	if (result) {
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
	}
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
		/**
		 *	exclude anything that matches with filter
		 *  example
		 * 		filters:{
		 * 			id: [1,2],
		 * 			refill_status: ["Ready","In Process"]
		 * 		}
		 */
		var proceed = true;
		/**
		 * _.some is used to break the loop
		 * when proceed is false
		 */
		_.some(filters, function(filter, key) {
			if (_.indexOf(filter, prescription.get(key)) !== -1) {
				proceed = false;
				//breaks the loop
				return true;
			}
			return false;
		});
		if (!proceed) {
			return false;
		}
		/**
		 * process sections
		 */
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
					tooltip : String.format($.strings[daysLeft === 0 ? "prescReadyPickupAttrRestockToday" : "prescReadyPickupAttrRestock"], daysLeft, $.strings[daysLeft > 1 ? "strDays" : "strDay"]),
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
				 * if  anticipated_refill_date is <= prescription_ready_for_refill - move to ready for refill
				 * */
				var anticipatedRefillDate = moment(prescription.get("anticipated_refill_date"), apiCodes.date_format);
				dueInDays = anticipatedRefillDate.diff(currentDate, "days");
				if (dueInDays <= Alloy.CFG.prescription_ready_for_refill) {
					section = "readyRefill";
					/**
					 * prevent any actions on list when selectable is true, use masterDetailWithLIcon only
					 * show auto hide button when anticipated_refill_date - current date  <= prescription_auto_hide
					 */
					if (!args.selectable && dueInDays <= Alloy.CFG.prescription_auto_hide) {
						template = "masterDetailBtn";
						prescription.set({
							btnClasses : detailBtnClasses,
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
				subtitle : $.strings.strPrefixRx.concat(prescription.get("rx_number")),
				selected : false
			});
		}
		var rowParams = prescription.toJSON();
		rowParams.filterText = _.values(_.pick(rowParams, ["title", "subtitle", "detailTitle", "detailSubtitle"])).join(" ").toLowerCase();
		var row = Alloy.createController("itemTemplates/".concat(rowParams.itemTemplate), rowParams);
		switch(rowParams.itemTemplate) {
		case "masterDetailSwipeable":
			row.on("clickoption", didClickSwipeOption);
			break;
		case "masterDetailBtn":
			row.on("clickdetail", doConfirmHide);
			break;
		}
		sectionHeaders[rowParams.section] += rowParams.filterText;
		sections[rowParams.section].push(row);
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
				if (headerBtnDict) {
					/**
					 * section id is different for each section
					 * and callback property will be set to button and removed
					 * from object before applying it by uihelper
					 */
					_.extend(headerBtnDict, {
						sectionId : key,
						callback : didClickSelectAll
					});
				}
				tvSection = $.uihelper.createTableViewSection($, $.strings["prescSection".concat($.utilities.ucfirst(key, false))], sectionHeaders[key], false, false, headerBtnDict);
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
	if (!args.selectable) {
		Alloy.Globals.isSwipeInProgress = false;
		Alloy.Globals.currentRow = null;
	} else if (Alloy.Collections.prescriptions.length && !data.length) {
		/**
		 * alert user saying no prescriptions to select
		 * occurs when all available prescriptions are already selected
		 */
		$.uihelper.showDialog({
			message : $.strings.prescAddMsgEmptyList
		});
	}
}

function didClickSelectAll(e) {
	/**
	 * select all under this section prescriptions
	 */
	var sectionId = e.source.sectionId,
	    count = 0;
	_.each(sections, function(rows, skey) {
		if (skey === sectionId) {
			/**
			 * index till previous section
			 */
			var index = count - 1;
			_.each(rows, function(row, rkey) {
				/**
				 * index for this row
				 */
				index++;
				var params = row.getParams();
				params.selected = true;
				rows[rkey] = Alloy.createController("itemTemplates/masterDetailWithLIcon", params);
				$.tableView.updateRow( OS_IOS ? index : row.getView(), rows[rkey].getView());
			});
		}
		count += rows.length;
	});
}

function didChangeSearch(e) {
	$.tableView.filterText = e.value || e.source.getValue();
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
		doConfirmHide(e);
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

function doConfirmHide(e) {
	$.uihelper.showDialog({
		message : String.format($.strings.prescMsgHideConfirm, e.data.title),
		buttonNames : [$.strings.dialogBtnYes, $.strings.dialogBtnNo],
		cancelIndex : 1,
		success : function() {
			hidePrescription(e);
		}
	});
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
	    sectionKey,
	    rowKey,
	    row;
	_.some(sections, function(rows, skey) {
		count += rows.length;
		if (count > index) {
			sectionKey = skey;
			rowKey = index - (count - rows.length);
			/**
			 *breaks the loop once row is assigned
			 */
			row = rows[rowKey];
			return true;
		}
		return false;
	});
	if (row) {
		currentPrescription = row.getParams();
		if (args.selectable) {
			currentPrescription.selected = !currentPrescription.selected;
			sections[sectionKey][rowKey] = Alloy.createController("itemTemplates/masterDetailWithLIcon", currentPrescription);
			$.tableView.updateRow( OS_IOS ? index : row.getView(), sections[sectionKey][rowKey].getView());
			currentPrescription = null;
		} else {
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

function didClickSubmit(e) {
	/**
	 * send selected prescriptions
	 * through the controller arguments
	 * if it is from store details to order details
	 *
	 * send selected prescriptions back
	 * on the controller arguments
	 * to the previous screen order details
	 */
	var prescriptions;
	if (args.navigation) {
		prescriptions = [];
	} else if (args.prescriptions) {
		prescriptions = args.prescriptions;
	}
	_.each(sections, function(rows) {
		_.each(rows, function(row) {
			var prescription = row.getParams();
			if (prescription.selected) {
				prescriptions.push(prescription);
			}
		});
	});
	if (args.navigation) {
		if (prescriptions.length) {
			var ctrlArguments = args.navigation.ctrlArguments || {};
			ctrlArguments.prescriptions = prescriptions;
			$.app.navigator.open(args.navigation);
		} else {
			/**
			 *need at least one prescription to move forward
			 */
			$.uihelper.showDialog({
				message : $.strings.prescAddMsgNoneSelected
			});
		}
	} else if (args.prescriptions) {
		$.app.navigator.close();
	}
}

function focus() {
	/*
	 * avoid null pointer if another controller or another instance of this controller
	 * used this global variable in it's life span
	 */
	Alloy.Globals.currentTable = $.tableView;
	/**
	 * focus will be called whenever window gets focus / brought to front (closing a window)
	 * identify the first focus with a flag isWindowOpen
	 * Note: Moving this api call to init can show dialog on previous window on android
	 * as activities are created once window is opened
	 */
	if (!isWindowOpen) {
		isWindowOpen = true;
		var codes = Alloy.Models.sortOrderPreferences.get("code_values");
		if (args.selectable && Alloy.Collections.prescriptions.length) {
			/**
			 * when prescriptions is already there in collection
			 * sort order preferences should also be there in place
			 * need not to get them again from api
			 * if not available (length is 0) then calling api in else
			 */
			$.sortPicker.setItems(codes);
			didGetPrescriptionList();
		} else {
			if (codes) {
				$.sortPicker.setItems(codes);
				getPrescriptionList();
			} else {
				getSortOrderPreferences();
			}
		}
	} else if (currentPrescription && currentPrescription.shouldUpdate) {
		/**
		 * checking whether any updates made from prescription details / any other detail screen
		 */
		currentPrescription = null;
		getPrescriptionList();
	}
}

function terminate() {
	/**
	 * reset only when required
	 * only when it is a list screen not selectable
	 */
	Alloy.Globals.currentRow = null;
	Alloy.Globals.currentTable = null;
	Alloy.Globals.isSwipeInProgress = false;
}

exports.init = init;
exports.focus = focus;
exports.terminate = terminate;
exports.backButtonHandler = hideAllPopups;
