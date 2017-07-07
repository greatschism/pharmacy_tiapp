var args = $.args,
    moment = require("alloy/moment"),
    logger = require("logger"),
    authenticator = require("authenticator"),
    rx = require("rx"),
    apiCodes = Alloy.CFG.apiCodes,
    validator = args.validator,
    titleClasses = ["left", "h4", "wrap-disabled"],
    subtitleClasses = ["margin-top-small", "left", "inactive-fg-color", "wrap-disabled"],
    subtitleWrapClasses = ["margin-top-small", "left", "inactive-fg-color"],
    headerBtnDict,
    swipeOptions,
    sections,
    currentPrescription,
    isWindowOpen,
    analyticsCategory;

function init() {
	//alert(JSON.stringify(args,null,4) );

	analyticsCategory = require("moduleNames")[$.ctrlShortCode] + "-" + require("ctrlNames")[$.ctrlShortCode];
	/**
	 * may not be available when
	 * showHiddenPrescriptions is true
	 */	
	if ($.unhideHeaderView) {
		$.vDividerView.height = $.uihelper.getHeightFromChildren($.unhideHeaderView);
	}
	if ($.tooltip) {
		$.tooltip.updateArrow($.createStyle({
			classes : ["direction-up"]
		}).direction, $.createStyle({
			classes : ["bg-color", "i5", "primary-fg-color", "icon-tooltip-arrow-up"]
		}));
	}
	/**
	 * may not be available when
	 * showHiddenPrescriptions is true
	 */
	if ($.sortPicker) {
		$.sortPicker.setItems(Alloy.Models.sortOrderPreferences.get("code_values"));
	}
	//search icon
	$.searchTxt.setIcon("", "left", $.createStyle({
		classes : ["margin-left-small", "i5", "inactive-fg-color", "bg-color-disabled", "touch-disabled", "icon-search"],
		id : "searchBtn"
	}));
	//clear button
	$.searchTxt.setIcon("", "right", $.createStyle({
		classes : ["margin-right-small", "i5", "inactive-fg-color", "bg-color-disabled", "touch-enabled", "icon-filled-cancel", "accessibility-enabled"],
		id : "clearBtn",
		accessibilityLabel : "clear search"
	}));
	if (args.selectable) {
		headerBtnDict = $.createStyle({
			classes : ["right", "fill-height", "h5", "bg-color-disabled", "active-fg-color", "border-disabled"],
			id : "prescSelectAllBtn"
		});
	} else {
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



	$.searchbar.visible = false;
	$.checkoutTipView.visible = false;

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

	$.rightNavBtn.getNavButton().accessibilityLabel = Alloy.Globals.strings.iconAccessibilityLblOptionsMenu;

	if(args.hideCheckoutHeader)
	{
		$.checkoutTipView.visible = true;
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
		$.app.navigator.hideLoader();
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

	var debugCounterOOS = 0;
	var debugCounterPF = 0;

	Alloy.Collections.prescriptions.each(function(prescription) {
		/**
		 * If the user don't pick up the prescription after the restock period, DAYS_TO_RESTOCK – (TODAY_DATE - LAST_FILLED_DATE)
		 * then it is returned to the "Ready for refill" list.
		 */
		var daysLeft;
		if (prescription.get("refill_status") == apiCodes.refill_status_ready) {
			daysLeft = parseInt(Alloy.Models.appload.get("restocking_period") || 0) - currentDate.diff(moment(prescription.get("presc_last_filled_date"), apiCodes.date_time_format), "days");
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
			if (args.selectable) {
				prescription.set({
					itemTemplate : "masterDetailWithLIcon",
					masterWidth : 100,
					detailWidth : 0,
					subtitle : $.strings.strPrefixRx.concat(prescription.get("rx_number")),
					subtitleClasses : subtitleClasses
				});
			} else {
				var requestedDate = prescription.get("latest_refill_requested_date") ? moment(prescription.get("latest_refill_requested_date"), apiCodes.date_time_format) : currentDate,
				    progress = 0,
				    subtitle;
				if (prescription.get("latest_refill_promised_date") && Alloy.Models.appload.get("features").is_promisetime_enabled === "1") {
					var promisedDate = moment(prescription.get("latest_refill_promised_date"), apiCodes.date_time_format),
					    totalTime = promisedDate.diff(requestedDate, "seconds", true),
					    timeSpent = currentDate.diff(requestedDate, "seconds", true);
					subtitle = String.format($.strings.prescInProgressLblPromise, promisedDate.format(Alloy.CFG.day_of_week_time_format));
					progress = Math.floor((timeSpent / totalTime) * 100);
				} else {
					subtitle = $.strings.strPrefixRx.concat(prescription.get("rx_number"));
					progress = currentDate.diff(requestedDate, "hours", true) > Alloy.CFG.prescription_progress_x_hours ? Alloy.CFG.prescription_progress_x_hours_after : Alloy.CFG.prescription_progress_x_hours_before;
				}

				if (prescription.get("refill_transaction_status") == "Out Of Stock") {
					prescription.set({
						className : "OOS",
						itemTemplate : "completed",
						customIconNegative : "icon-error",
						masterWidth : 100,
						detailWidth : 0,
						subtitle : $.strings.strPrefixRx.concat(prescription.get("rx_number")),
						detailTitle : prescription.get("refill_transaction_message"),
						detailColor : "negative-fg-info-color"
						/*subtitleClasses : subtitleWrapClasses*/
					});
				} else if (prescription.get("refill_transaction_status") == "Partial Fill" && prescription.get("refill_transaction_message") != null) {
					prescription.set({
						className : "PF",
						itemTemplate : "completed",
						masterWidth : 100,
						detailWidth : 0,
						customIconYield : "icon-thin-filled-success",
						subtitle : $.strings.strPrefixRx.concat(prescription.get("rx_number")),
						detailTitle : prescription.get("refill_transaction_message"),
						detailColor : "yield-fg-info-color"
						/*subtitleClasses : subtitleWrapClasses*/
					});
				} else if (prescription.get("refill_transaction_status") == "Rx In Process" && prescription.get("refill_transaction_message") != null) {
					prescription.set({
						className : "IP",
						itemTemplate : "completed",
						masterWidth : 100,
						detailWidth : 0,
						subtitle : $.strings.strPrefixRx.concat(prescription.get("rx_number")),
						detailTitle : prescription.get("refill_transaction_message")
						/*subtitleClasses : subtitleWrapClasses*/
					});
				} else if (prescription.get("refill_transaction_status") == "Rejected") {
					var message = prescription.get("refill_transaction_message");
					logger.debug("\n\n\n transaction message", message);

					// var phoneNumber =  $.utilities.isPhoneNumber(message.substr(((message.search("@"))+1) , 11)) ? message.substr(((message.search("@"))+1) , 11) : "" ;

					var phoneNumber = message.substr((message.search("@") + 2), 15) || "";

					logger.debug("\n\n\n extracted phone number", phoneNumber);
					prescription.set({
						className : "RJ",
						itemTemplate : "completed",
						customIconRejected : "icon-error",
						masterWidth : 100,
						detailWidth : 0,
						subtitle : $.strings.strPrefixRx.concat(prescription.get("rx_number")),
						detailTitle : prescription.get("refill_transaction_message"),
						detailColor : "tentative-fg-color",
						phone_formatted : ((phoneNumber != "") && $.utilities.formatPhoneNumber(phoneNumber)) ? phoneNumber : ""
						/*subtitleClasses : subtitleWrapClasses*/
					});

				} else {
					prescription.set({
						itemTemplate : "inprogress",
						subtitle : subtitle,
						progress : progress,
						subtitleClasses : subtitleWrapClasses
					});
				}
			}

			prescription.set({
				section : "inProgress",
				titleClasses : titleClasses,
				canHide : false
			});

			break;
		case apiCodes.refill_status_ready:
			if (args.selectable) {
				prescription.set({
					itemTemplate : "masterDetailWithLIcon",
					masterWidth : 100,
					detailWidth : 0,
					subtitleClasses : subtitleClasses
				});
			} else {
				if (daysLeft <= Alloy.CFG.prescription_pickup_reminder) {
					prescription.set({
						tooltip : String.format($.strings[daysLeft === 0 ? "prescReadyPickupAttrRestockToday" : "prescReadyPickupAttrRestock"], daysLeft, $.strings[daysLeft > 1 ? "strDays" : "strDay"]),
						tooltipType : "negative"
					});
				}
				prescription.set({
					itemTemplate : "completed"
				});
			}
			prescription.set({
				section : "readyPickup",
				titleClasses : titleClasses,
				subtitle : $.strings.strPrefixRx.concat(prescription.get("rx_number")),
				detailTitle : $.strings.prescReadyPickupLblReady,
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
			
			if((prescription.get("refill_transaction_status") == "Rejected" && prescription.get("refill_transaction_message") != null)) //|| (prescription.get("refill_transaction_status") == "Rx In Process" && prescription.get("refill_transaction_message") != null))
			{
				var message = prescription.get("refill_transaction_message");
					logger.debug("\n\n\n transaction message", message);

					// var phoneNumber =  $.utilities.isPhoneNumber(message.substr(((message.search("@"))+1) , 11)) ? message.substr(((message.search("@"))+1) , 11) : "" ;

					var phoneNumber = message.substr((message.search("@") + 2), 15) || "";

					logger.debug("\n\n\n other prescriptions - extracted phone number",phoneNumber);
					prescription.set({
						section : section,
						itemTemplate : "completed",
						customIconRejected : "icon-error",
						masterWidth : 100,
						detailWidth : 0,
						subtitle : $.strings.strPrefixRx.concat(prescription.get("rx_number")),
						detailTitle : prescription.get("refill_transaction_message"),
						detailColor : "tentative-fg-color",
						phone_formatted : ((phoneNumber != "") && $.utilities.formatPhoneNumber(phoneNumber)) ? phoneNumber : ""
						});		
			}
			else{
			if (prescription.get("anticipated_refill_date")) {
				/**
				 * if  anticipated_refill_date is <= upcomingRefillDaysBeforeARD - move to ready for refill
				 * */
				var anticipatedRefillDate = moment(prescription.get("anticipated_refill_date"), apiCodes.date_format);
				dueInDays = anticipatedRefillDate.diff(currentDate, "days");
				if (dueInDays <= parseInt(Alloy.Models.appload.get("upcomingRefillDaysBeforeARD"))) {
					section = "readyRefill";
					/**
					 * prevent any actions on list when selectable is true, use masterDetailWithLIcon only
					 * show auto hide button when anticipated_refill_date - current date  <= prescription_auto_hide
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
				section : section,
				itemTemplate : template,
				options : Ti.App.accessibilityEnabled ? null : swipeOptions,
				titleClasses : titleClasses,
				subtitleClasses : subtitleClasses,
				subtitle : $.strings.strPrefixRx.concat(prescription.get("rx_number")),
				canHide : true
			});
			}
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
		case "completed":
			row.on("clickphone", didClickPhone);

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
			}
			 else {
				if (headerBtnDict) {
					/***
					 * determine whether it should be
					 * select all / none
					 */
					var selected = false;
					_.some(rows, function(row) {
						if (!row.getParams().selected) {
							selected = true;
							return true;
						}
					});
					/**
					 * section id is different for each section
					 * and callback property will be set to button and removed
					 * from object before applying it by uihelper
					 */
					_.extend(headerBtnDict, {
						sectionId : key,
						selected : selected,
						callback : didClickSelectAll,
						title : $.strings[ selected ? "prescAddSectionBtnAll" : "prescAddSectionBtnNone"]
					});
				}
				
				if(key === "readyPickup" && !args.hideCheckoutHeader && Alloy.CFG.is_checkout_cart_enabled ){
									

					hasReadyPrescription = 1;

					//The following logic block assembles and displays the CC info prompt (MCE-169)
					//TODO: presumedly it should be extrapolated into it's own module
					//This block should be cut/paste to implement in a different view controller
					if( !$.utilities.getProperty(Alloy.CFG.checkout_info_prompted, false, "bool", false) )  {

						var dialogView = $.UI.create("ScrollView", {
							apiName : "ScrollView",
							classes : ["top", "auto-height", "vgroup"]
						});
						dialogView.add($.UI.create("Label", {
							apiName : "Label",
							classes : ["margin-top-extra-large", "margin-left-extra-large", "margin-right-extra-large", "h5", "txt-center"],
							text : $.strings.checkoutPrompt
						}));

						var btn = $.UI.create("Button", {
							apiName : "Button",
							classes : ["margin-top-large", "margin-left-extra-large", "margin-right-extra-large", "primary-bg-color", "primary-light-fg-color", "primary-border"],
							title : $.strings.checkoutFindoutPrompt,
							index : 0
						});

						$.addListener(btn, "click", function(){

							// if the 'dont show me again checkbox is checked'
							if(swtCheckbox.classes.indexOf("icon-checkbox-checked") > -1 ) {
								//set the flag that the user has been prompted
								$.utilities.setProperty(Alloy.CFG.checkout_info_prompted, true, "bool", false);
							}


							$.contentView.remove($.checkoutInfoDialog.getView());

							var dialogView2 = $.UI.create("ScrollView", {
								apiName : "ScrollView",
								classes : ["top", "auto-height", "vgroup"]
							});
							dialogView2.add($.UI.create("Label", {
								apiName : "Label",
								classes : ["margin-top-extra-large", "margin-left-extra-large", "margin-right-extra-large", "h3"],
								text : $.strings.checkoutPromptMore
							}));
							var btn3 = $.UI.create("Button", {
								apiName : "Button",
								classes : ["margin-bottom-extra-large", "margin-left-extra-large", "margin-right-extra-large", "bg-color", "active-fg-color", "border-color-disabled"],
								title : $.strings.checkoutClose,
								index : 0
							});
							$.addListener(btn3, "click", function(){
								$.contentView.remove($.checkoutInfoDialog.getView());
								$.checkoutInfoDialog = null;
							});
							dialogView2.add(btn3);

							$.checkoutInfoDialog = Alloy.createWidget("ti.modaldialog", "widget", $.createStyle({
								classes : ["modal-dialog"],
								children : [dialogView2]
							}));
							$.contentView.add($.checkoutInfoDialog.getView());
							$.checkoutInfoDialog.show();
						});
						dialogView.add(btn);

						var swt = $.UI.create("View", {
							apiName : "View",
							classes : ["margin-top-large", "margin-left-extra-large", "margin-right-extra-large",  "auto-height"],
							index : 1
						});
						var swtCheckbox = $.UI.create("Label", {
							apiName : "Label",
							classes : ["margin-left-extra-large", "i4",  "icon-checkbox-unchecked" ],
						});
						$.addListener(swtCheckbox, "click", function(){
							Ti.API.info( "swtCheckbox.getProperties " + JSON.stringify(swtCheckbox.classes) ) ;
							
							if(swtCheckbox.classes.indexOf("icon-checkbox-unchecked") > -1 ) {
								swtCheckbox.applyProperties($.createStyle({
	  								classes : ["margin-left-extra-large", "i4",  "icon-checkbox-checked" ],
								}));
							} else {
								swtCheckbox.applyProperties($.createStyle({
	  								classes : ["margin-left-extra-large", "i4",  "icon-checkbox-unchecked" ],
								}));
							}

						});

						var swtLabel = $.UI.create("Label", {
							apiName : "Label",
							classes : ["h5",  "txt-center"],
							text : $.strings.checkoutRemindCheckbox,
						});
						swt.add(swtCheckbox);
						swt.add(swtLabel);
						dialogView.add(swt);

						var btn2 = $.UI.create("Button", {
							apiName : "Button",
							classes : ["margin-bottom-extra-large", "margin-left-extra-large", "margin-right-extra-large", "bg-color", "active-fg-color", "border-color-disabled"],
							title : $.strings.checkoutClose,
							index : 2
						});
						$.addListener(btn2, "click", function(){

								// if the 'dont show me again checkbox is checked'
							if(swtCheckbox.classes.indexOf("icon-checkbox-checked") > -1 ) {
								//set the flag that the user has been prompted
								$.utilities.setProperty(Alloy.CFG.checkout_info_prompted, true, "bool", false);
							}

							$.contentView.remove($.checkoutInfoDialog.getView());
							$.checkoutInfoDialog = null;
						});
						dialogView.add(btn2);

						$.checkoutInfoDialog = Alloy.createWidget("ti.modaldialog", "widget", $.createStyle({
							classes : ["modal-dialog"],
							children : [dialogView]
						}));
						$.contentView.add($.checkoutInfoDialog.getView());
						$.checkoutInfoDialog.show();
					}


					//the title here is overridden in uihelper to show the shopping cart image
					//TODO: either refactor this to take the image passed as a value or add the shopping cart and arrow to the custom font
					//TODO: either way, the prescriptions logic for the custom 'readyPickup' section header needs to be refactored into the prescriptions
					//TODO: module as opposed to living in the uihelper as much as possible
					var readyHeaderDict = $.createStyle({
						classes : ["right"],
						title : "Checkout",
						callback : didClickCheckout
					});										
					tvSection = $.uihelper.createTableViewSection($, $.strings["prescSection".concat($.utilities.ucfirst(key, false))], sectionHeaders[key], false, readyHeaderDict);
				}
				}else{
					tvSection = $.uihelper.createTableViewSection($, $.strings["prescSection".concat($.utilities.ucfirst(key, false))], sectionHeaders[key], false, headerBtnDict);
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

function didClickCheckout(e)
{
	$.app.navigator.open({
		titleid : "titleReadyPrescriptions",
		ctrl : "prescriptions",
		ctrlArguments : {
			filters : {
				refill_status : [apiCodes.refill_status_in_process,apiCodes.refill_status_sold],
				section: ["others"]
			},
			prescriptions :null,
			patientSwitcherDisabled : true,
			useCache : true,
			selectable : true,
			hideCheckoutHeader : true
		},
		stack : true 
	});
	
}

function didClickPhone(e) {			
	if(e.data.phone_formatted)
	{
		$.uihelper.getPhoneWithContactsPrompt({
			firstName : $.strings.strClientName + " Pharmacy",
			phone : {
				work : [e.data.phone_formatted]
			}
		}, $.utilities.validatePhoneNumber(e.data.phone_formatted));
		
		logger.debug("\n\n\n presc phone formatted",e.data.phone_formatted,"\n\n\n");
		logger.debug("\n\n\n presc phone plain",$.utilities.validatePhoneNumber(e.data.phone_formatted),"\n\n\n");
	}
}

function didClickSelectAll(e) {
	/**
	 * select all can't be
	 * performed when filter is
	 * applied
	 */
	if ($.tableView.filterText) {
		return false;
	}
	/**
	 * select all under this section prescriptions
	 */
	var count = 0,
	    headerBtn = e.source,
	    sectionId = headerBtn.sectionId;
	_.some(sections, function(rows, sid) {
		if (sid === sectionId) {
			/**
			 * index till previous section
			 */
			var index = count - 1,
			    selected = headerBtn.selected;
			_.each(rows, function(row, rid) {
				/**
				 * index for this row
				 */
				index++;
				var params = row.getParams();
				params.selected = selected;
				rows[rid] = Alloy.createController("itemTemplates/masterDetailWithLIcon", params);
				$.tableView.updateRow( OS_IOS ? index : row.getView(), rows[rid].getView());
			});
			headerBtn.selected = !headerBtn.selected;
			headerBtn.title = $.strings[headerBtn.selected ? "prescAddSectionBtnAll" : "prescAddSectionBtnNone"];
			return true;
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
		$.analyticsHandler.trackEvent(analyticsCategory, "click", "ToggleSearchOptionDialog");
		toggleSearch();
		break;
	case 1:
		$.analyticsHandler.trackEvent(analyticsCategory, "click", "PatientSyncOptionDialog");
		/**
		 * Refresh: By default sync happens on server side
		 * while patient authenticate, here we force
		 * sync the patient data / prescriptions
		 * with the dispensing system
		 */
		$.http.request({
			method : "patient_sync",
			keepLoader : true,
			success : prepareData
		});
		break;
	case 2:
		$.analyticsHandler.trackEvent(analyticsCategory, "click", "SortOptionDialog");
		$.sortPicker.show();
		break;
	case 3:
		$.analyticsHandler.trackEvent(analyticsCategory, "click", "UnhidePrescriptionsOptionDialog");
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
			titleClasses : titleClasses,
			subtitleClasses : subtitleClasses,
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
		$.analyticsHandler.trackEvent(analyticsCategory, "swipe", "HideBtn");
		doConfirmHide(e);
		break;
	case 2:
		$.analyticsHandler.trackEvent(analyticsCategory, "swipe", "RefillBtn");
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
			data : [{
				prescriptions : [{
					id : e.data.id
				}]
			}]
		},
		keepLoader : true,
		success : prepareData
	});
}

function didClickTableView(e) {
	// alert('in parent');
	if (Alloy.Globals.currentRow) {
		return Alloy.Globals.currentRow.touchEnd();
	}
	var index = e.index,
	    count = 0,
	    sectionId,
	    rowId,
	    row;
	_.some(sections, function(rows, sid) {
		count += rows.length;
		if (count > index) {
			sectionId = sid;
			rowId = index - (count - rows.length);
			/**
			 *breaks the loop once row is assigned
			 */
			row = rows[rowId];
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
				sections[sectionId][rowId] = Alloy.createController("itemTemplates/masterDetailWithLIcon", prescription);
				$.tableView.updateRow( OS_IOS ? index : row.getView(), sections[sectionId][rowId].getView());
				/**
				 * verify & update header button's
				 * title and flag
				 */
				var headerBtn;
				_.some($.tableView.data, function(tvSection) {
					var btn = tvSection.headerView && tvSection.headerView.children[0];
					if (btn && btn.sectionId === sectionId) {
						headerBtn = btn;
						return true;
					}
				});
				if (headerBtn && headerBtn.selected === prescription.selected) {
					var selected = false;
					_.some(sections[sectionId], function(srow) {
						if (!srow.getParams().selected) {
							selected = true;
							return true;
						}
					});
					if (selected !== headerBtn.selected) {
						headerBtn.selected = selected;
						headerBtn.title = $.strings[ selected ? "prescAddSectionBtnAll" : "prescAddSectionBtnNone"];
					}
				}
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
		bottom = $.checkoutTipView.getVisible() ? $.checkoutTipView.height + bottom + $.submitBtn.height + $.submitBtn.bottom : bottom + $.submitBtn.height;
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
	if (Ti.App.accessibilityEnabled) {
		$.tooltip && $.tooltip.hide();
	};
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
