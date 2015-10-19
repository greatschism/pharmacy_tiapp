var args = arguments[0] || {},
    moment = require("alloy/moment"),
    rx = require("rx"),
    apiCodes = Alloy.CFG.apiCodes,
    validator = args.validator,
    headerBtnDict,
    detailBtnClasses,
    swipeOptions,
    sections,
    currentPrescription,
    isWindowOpen;

function init() {
	/**
	 * may not be available when
	 *  showHiddenPrescriptions is true
	 */
	if ($.unhideHeaderView) {
		$.vDividerView.height = $.uihelper.getHeightFromChildren($.unhideHeaderView);
	}
	if (args.selectable) {
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
	/**
	 * may not be available when
	 *  showHiddenPrescriptions is true
	 */
	if ($.sortPicker) {
		$.sortPicker.setItems(Alloy.Models.sortOrderPreferences.get("code_values"));
	}
	/**
	 * by default point to a
	 * non partial account
	 * only if patientSwitcherDisabled is false
	 */
	$.patientSwitcher.set({
		revert : args.selectable && !args.patientSwitcherDisabled,
		title : $.strings.prescPatientSwitcher,
		where : args.patientSwitcherDisabled ? null : {
			is_partial : false
		}
	});
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
		/**
		 * use existing data set
		 * only when useCache is true
		 * mostly used when
		 * patientSwitcherDisabled and selectable
		 * are true
		 * i.e - order details to prescriptions
		 */
		if (args.useCache && Alloy.Collections.prescriptions.length) {
			prepareList();
		} else {
			prepareData();
		}
	} else if (currentPrescription && currentPrescription.shouldUpdate) {
		/**
		 * checking whether any updates made from prescription details / any other detail screen
		 */
		currentPrescription = null;
		prepareData();
	}
}

function prepareData() {
	//reset search if any
	if ($.searchTxt.getValue()) {
		$.searchTxt.setValue("");
		$.tableView.filterText = "";
	}
	/**
	 * occurs on first launch
	 * when all accounts
	 * are partial
	 */
	var currentPatient = $.patientSwitcher.get();
	if (currentPatient.get("is_partial")) {
		/**
		 * reset table if any
		 */
		if (Alloy.Collections.prescriptions.length) {
			Alloy.Collections.prescriptions.reset([]);
			prepareList();
		}
		//update strings and show
		$.partialDescLbl.text = $.strings.prescPartialLblDesc;
		if (!$.partialView.visible) {
			$.partialView.visible = true;
		}
	} else {
		//hide if any
		if ($.partialView.visible) {
			$.partialView.visible = false;
		}
		getPrescriptions(apiCodes.prescription_display_status_active, didGetPrescriptions, args.showHiddenPrescriptions, !args.showHiddenPrescriptions);
	}
}

function getPrescriptions(status, callback, keepLoader, errorDialogEnabled) {
	/**
	 * get data
	 * use selected sort option
	 * or
	 * one from account manager preferences
	 * (not current patient, which may mismatch when sort picker is shown)
	 *
	 * keepLoader is true when status is active and args.showHiddenPrescriptions
	 * is true as there will be a next call for hidden prescriptions
	 *
	 * errorDialogEnabled should be false when keepLoader is true
	 * even if there are no active prescriptions, hidden prescriptions may
	 * return something
	 */
	$.http.request({
		method : "prescriptions_list",
		params : {
			feature_code : "THXXX",
			data : [{
				prescriptions : {
					sort_order_preferences : Alloy.Models.sortOrderPreferences.get("selected_code_value") || Alloy.Collections.patients.at(0).get("pref_prescription_sort_order"),
					prescription_display_status : status
				}
			}]
		},
		keepLoader : keepLoader,
		errorDialogEnabled : errorDialogEnabled,
		success : callback,
		failure : callback
	});
}

function didGetPrescriptions(result, passthrough) {
	/**
	 * check whether it is a success call
	 * since no prescriptions found is considered as a error and data is null
	 * set prescriptions node to empty array in order to reset the list view
	 */
	if (!result.data) {
		//this resets the list populated already
		result.data = {
			prescriptions : []
		};
	}
	//process data from server
	Alloy.Collections.prescriptions.reset(result.data.prescriptions);
	/**
	 * check whether to show hidden prescriptions too
	 * error dialog from api end will not be shown
	 */
	if (args.showHiddenPrescriptions) {
		getPrescriptions(apiCodes.prescription_display_status_hidden, didGetHiddenPrescriptions, false, false);
	} else {
		prepareList();
	}
}

function didGetHiddenPrescriptions(result, passthrough) {
	if (!result.data) {
		//this resets the list populated already
		result.data = {
			prescriptions : []
		};
	}
	//append to existing prescriptions
	Alloy.Collections.prescriptions.add(result.data.prescriptions);
	//just sort it alphabetically
	Alloy.Collections.prescriptions.reset(Alloy.Collections.prescriptions.sortBy(function(model) {
		return model.get("presc_name").toLowerCase();
	}));
	//prepare table
	prepareList();
}

function prepareList() {
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
	    filters = args.filters || {},
	    selectedItems = args.selectedItems || [];
	/**
	 * current user preferences
	 * about hide zero refill prescription
	 * Note: as of now server returns
	 * the flag as string
	 */
	var hideZeroRefillPrescriptions = parseInt($.patientSwitcher.get().get("hide_zero_refill_prescriptions")) || 0;
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
		 * hide zero refill
		 * prescriptions if enabled
		 * Note: zero refill
		 * prescriptions are not ignored from
		 * med reminders or when the status
		 * is getting refilled or ready for pickup
		 * within prescriptions list
		 */
		if (hideZeroRefillPrescriptions && !parseInt(prescription.get("refill_left")) && ((args.selectable && validator != "medReminder") || (!args.selectable && prescription.get("refill_status") != apiCodes.refill_status_ready && prescription.get("refill_status") != apiCodes.refill_status_in_process))) {
			return false;
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
		 * append title and
		 * selected flag
		 *
		 * selected flag may be decided
		 * based on selected items array
		 */
		prescription.set({
			title : $.utilities.ucword(prescription.get("presc_name")),
			selected : _.indexOf(selectedItems, prescription.get("id")) !== -1
		});
		//process sections
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
				progress = currentDate.diff(requestedDate, "hours", true) > Alloy.CFG.prescription_progress_x_hours ? Alloy.CFG.prescription_progress_x_hours_after : Alloy.CFG.prescription_progress_x_hours_before;
			}
			prescription.set({
				section : "inProgress",
				itemTemplate : args.selectable ? "masterDetailWithLIcon" : "inprogress",
				masterWidth : 100,
				detailWidth : 0,
				subtitle : subtitle,
				progress : progress,
				canHide : false
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
				section : "readyPickup",
				itemTemplate : args.selectable ? "masterDetailWithLIcon" : "completed",
				masterWidth : 100,
				detailWidth : 0,
				subtitle : $.strings.prescReadyPickupLblReady,
				canHide : false
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
				section : section,
				itemTemplate : template,
				options : swipeOptions,
				subtitle : $.strings.strPrefixRx.concat(prescription.get("rx_number")),
				canHide : true
			});
		}
		var rowParams = prescription.toJSON(),
		    row;
		rowParams.filterText = _.values(_.pick(rowParams, ["title", "subtitle", "detailTitle", "detailSubtitle"])).join(" ").toLowerCase();
		row = Alloy.createController("itemTemplates/".concat(rowParams.itemTemplate), rowParams);
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
			 * Hide section headers when
			 * sectionHeaderViewDisabled is true (or)
			 * when other section is only visible
			 * Note: others section is the last section in sections list
			 */
			if (args.sectionHeaderViewDisabled || (key == "others" && data.length === 0)) {
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
	//further resets
	if (!args.selectable) {
		/*
		 *  reset the swipe flag
		 *  once a fresh list is loaded
		 *  not resetting this block further swipe actions
		 */
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
	 * select all can't be
	 * applied when filter is
	 * applied
	 */
	if ($.tableView.filterText) {
		return false;
	}
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
	/**
	 * cancel index may vary,
	 * based on arguments, so check
	 * the cancel flag before proceed
	 */
	if (e.cancel) {
		return false;
	}
	switch(e.index) {
	case 0:
		toggleSearch();
		break;
	case 1:
		prepareData();
		break;
	case 2:
		$.sortPicker.show();
		break;
	case 3:
		getPrescriptions(apiCodes.prescription_display_status_hidden, prepareUnhidePicker, false, true);
		break;
	}
}

function toggleSearch() {
	var top = $.headerView.rect.height,
	    opacity = 0;
	if ($.tableView.top == top) {
		opacity = 1;
		top += $.searchbar.rect.height;
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
		if (top !== $.headerView.rect.height) {
			$.searchTxt.focus();
		}
	});
	$.tableView.animate(tAnim);
	/**
	 * required when partialView view is
	 * enabled or visible or when switched
	 * to a partial account
	 * with search is enabled
	 */
	var pAnim = Ti.UI.createAnimation({
		top : top,
		duration : 200
	});
	pAnim.addEventListener("complete", function onComplete() {
		pAnim.removeEventListener("complete", onComplete);
		$.partialView.top = top;
	});
	$.partialView.animate(pAnim);
}

function prepareUnhidePicker(result, passthrough) {
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
			success : prepareData
		});
	}
}

function didClickUnhideClose(e) {
	$.unhidePicker.hide();
}

function didClickSortPicker(e) {
	Alloy.Models.sortOrderPreferences.set("selected_code_value", e.data.code_value);
	prepareData();
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
		/**
		 * check whether this
		 * prescription can be refilled
		 * eg: Schedule 2 can't be refilled
		 * through this app
		 */
		var prescription = e.data;
		rx.canRefill(prescription, function didValidate() {
			$.app.navigator.open({
				titleid : "titleOrderDetails",
				ctrl : "orderDetails",
				ctrlArguments : {
					prescriptions : [prescription]
				},
				stack : true
			});
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
			prepareData();
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
		if (args.selectable) {
			var prescription = row.getParams(),
			    toggleSelection = function() {
				/**
				 * update selection flag
				 */
				prescription.selected = !prescription.selected;
				sections[sectionKey][rowKey] = Alloy.createController("itemTemplates/masterDetailWithLIcon", prescription);
				$.tableView.updateRow( OS_IOS ? index : row.getView(), sections[sectionKey][rowKey].getView());
			};
			/**
			 * validator
			 * will say which validation
			 * has to be done upon selection
			 *
			 * should be validate only if prescription.selected is false
			 * when it is selected by user, not when unselected
			 */
			if (prescription.selected || validator === "none") {
				/**
				 * no validator
				 */
				toggleSelection();
			} else if (validator === "medReminder") {
				/**
				 * used for med reminders
				 * verify whether this prescription
				 * has a reminder already.
				 */
				rx.hasMedReminder(args.reminderId, prescription, toggleSelection);
			} else {
				/**
				 * considered as default
				 * validator, to prevent any validation
				 * validator should be "none"
				 */
				rx.canRefill(prescription, toggleSelection);
			}
			return false;
		} else {
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
}

function hideAllPopups() {
	if ($.sortPicker && $.sortPicker.getVisible()) {
		return $.sortPicker.hide();
	}
	if ($.unhidePicker && $.unhidePicker.getVisible()) {
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
	if (!_.has(args, "minLength") || args.minLength <= prescriptions.length) {
		if (args.navigation) {
			var ctrlArguments = args.navigation.ctrlArguments || {};
			ctrlArguments.prescriptions = prescriptions;
			$.app.navigator.open(args.navigation);
		} else if (args.prescriptions) {
			$.app.navigator.close();
		}
	} else {
		/**
		 * need at least one prescription to move forward
		 */
		$.uihelper.showDialog({
			message : String.format($.strings.prescAddMsgSelectMore, args.minLength)
		});
	}
}

function didClickAddPresc(e) {
	$.app.navigator.open({
		titleid : "titlePrescriptionsAdd",
		ctrl : "familyMemberAddPresc",
		ctrlArguments : $.patientSwitcher.get().pick(["first_name", "last_name", "birth_date"]),
		stack : true
	});
}

function didPostlayout(e) {
	$.headerView.removeEventListener("postlayout", didPostlayout);
	var top = $.headerView.rect.height,
	    margin = $.tableView.bottom,
	    bottom;
	bottom = margin;
	if (args.selectable) {
		bottom += $.submitBtn.height + $.submitBtn.bottom;
		if ($.tooltip) {
			$.tooltip.applyProperties({
				top : top - margin
			});
			$.tooltip.show();
		}
	}
	$.searchbar.top = top;
	$.tableView.applyProperties({
		top : top,
		bottom : bottom
	});
	$.partialView.applyProperties({
		top : top,
		bottom : bottom
	});
}

function didClickHide(e) {
	$.tooltip.hide();
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
exports.backButtonHandler = hideAllPopups;
