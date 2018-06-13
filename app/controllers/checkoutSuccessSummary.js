var args = $.args,
    checkoutDetails = args.checkoutDetails || {},
    prescriptions = checkoutDetails.prescriptions || [],
    deliveryDetails = checkoutDetails.deliveryDetail,
    paymentDetails = checkoutDetails.cardDetails,
    logger = require("logger"),
    store,
    titleClasses = ["bottom", "right"],
    subtitleClasses = ["bottom", "right"],
    optionClasses = ["bottom", "right", "fg-color"];

function init() {
	var isSuccess = _.findWhere(prescriptions, {
		refill_is_error : false
	}),
	    isFailure = _.findWhere(prescriptions, {
		refill_is_error : true
	});
	var tKey,
	    iKey,
	    lKey;
	// isSuccess = true;
	// isFailure = false;

	isSuccess = false;
	isFailure = false;
	_.each(prescriptions, function(prescription) {
		if (prescription.refill_is_error == true) {
			isFailure = true;
		} else {
			isSuccess = true;
		}
	});

	if (isSuccess && isFailure) {
		//partial success
		lKey = "refillSuccessLblPartial";
	} else if (isSuccess) {
		//complete success
		iKey = "img-success";
		lKey = "refillSuccessLblSuccess";
	} else {
		//complete failure
		lKey = "refillSuccessLblFailure";
	}

	iKey = "img-success";
	lKey = "checkoutSuccessLblSuccess";

	/**
	 * Note: window is yet to be opened,
	 * actionBar / setTitle will not be
	 * available here at init
	 */
	// $.window.title = $.strings[tKey];
	if (iKey) {
		$.img.applyProperties($.createStyle({
			classes : ["margin-top-large", "margin-bottom-extra-large", iKey]
		}));
	} else {
		$.img.bottom = $.createStyle({
			classes : ["margin-bottom-large"]
		}).bottom;
	}
	$.lbl.text = $.strings[lKey];

}

function focus() {
	var storeId = prescriptions[0].original_store_id;
	if (storeId) {
		getStore(storeId);
	} else {
		updateTable();
	}
}

function getStore(storeId) {
	/**
	 *  prescriptions length should not be zero
	 *  at this screen
	 *  always call store get as we don't have
	 *  store's phone number with list api
	 */
	$.http.request({
		method : "stores_get",
		params : {
			data : [{
				stores : {
					id : storeId
				}
			}]
		},
		success : didGetStore
	});
}

function didGetStore(result, passthrough) {
	store = result.data.stores;
	var phoneFormatted = $.utilities.formatPhoneNumber(store.phone);
	_.extend(store, {
		phone_formatted : phoneFormatted,
		title : $.utilities.ucword(store.addressline1),
		subtitle : $.utilities.ucword(store.city) + ", " + store.state + ", " + store.zip,
		attributed : String.format($.strings.attrPhone, phoneFormatted)
	});
	updateTable();
}

function updateTable() {
	/**
	 * process table
	 */
	var data = [],
	    isMailOrder = args.pickupMode && args.pickupMode === Alloy.CFG.apiCodes.pickup_mode_mail_order;
	if (store || isMailOrder) {
		//add pickup details
		$.pickupSection = $.uihelper.createTableViewSection($, $.strings.refillSuccessSectionPickup);
		data.push($.pickupSection);
	}
	if (store) {
		/**
		 * this is a successful refill
		 * so store last used store id

		 if(! Alloy.Globals.isMailOrderService )
		 {
		 $.utilities.setProperty(Alloy.CFG.latest_store_refilled, store.id);
		 }
		 */
		var storeRow = Alloy.createController("itemTemplates/contentViewAttributed", store);
		storeRow.on("click", didClickStorePhone);
		$.pickupSection.add(storeRow.getView());
	}
	if (isMailOrder) {
		var isSuccess = _.findWhere(prescriptions, {
			refill_is_error : false
		}),
		    isFailure = _.findWhere(prescriptions, {
			refill_is_error : true
		});

		if ((isSuccess && isFailure) || isSuccess) {
			$.pickupSection.add(Alloy.createController("itemTemplates/label", {
				title : $.strings.refillSuccessLblMailOrder
			}).getView());
		}
	}
	/**
	 *  tentative case we are contacting your doctor
	 *  is not handled as api doesn't have a unique
	 *  identifier yet for that case
	 */
	$.prescSection = $.uihelper.createTableViewSection($, $.strings.refillSuccessSectionPresc);
	var successClasses = ["positive-fg-color", "icon-checkbox", "accessibility-disabled"],
	    failureClasses = ["negative-fg-color", "icon-cancel", "accessibility-disabled"];
	_.each(prescriptions, function(prescription) {
		_.extend(prescription, {
			iconClasses : successClasses
		});
		Ti.API.info(JSON.stringify(prescription));
		var params = {
			id : prescription.id,
			subtitle : prescription.rx_number,
			title : prescription.rx_name,
			detailTitle : prescription.copay,
			selected : true
		};
		$.prescSection.add(Alloy.createController("itemTemplates/contentViewWithLIcon", params).getView());
	});
	data.push($.prescSection);

	$.delDetailsSection = $.uihelper.createTableViewSection($, "Delivery details");

	/*
	 * 	prescriptions : checkoutPrescriptions,
	 deliveryDetail : {
	 type : selectedDeliveryType,
	 address_line : delAddressInfo.address,
	 city : delAddressInfo.city,
	 state : delAddressInfo.state,
	 zip : delAddressInfo.zip,
	 mobile_number : $.utilities.validatePhoneNumber(delAddressInfo.phone),
	 instructions : ""
	 },
	 cardDetails : {
	 creditCardType : card.paymentType.paymentTypeDesc,
	 lastFourDigit : card.lastFourDigits,
	 expirationDate : card.expiryDate
	 }
	 */
	var deliveryData = {
		section : "deliveryInfo",
		itemTemplate : "deliveryInfo",
		masterWidth : 100,
		address : deliveryDetails.address_line + "\n" + deliveryDetails.city + ", " + deliveryDetails.state + " " + deliveryDetails.zip + "\n" + deliveryDetails.mobile_number,
		titleClasses : titleClasses,
		subtitleClasses : subtitleClasses,
		deliveryOption : deliveryDetails.type,
		optionClasses : optionClasses,
		tertiaryTitle : "$" + checkoutDetails.totalAmount,
		detailTitle : "$" + checkoutDetails.deliveryCharge,
		detailSubtitle : "$".concat(parseFloat(checkoutDetails.totalAmount) + parseFloat(checkoutDetails.deliveryCharge))
	};

	var rowParams = deliveryData,
	    row;
	logger.debug("\n\n\n rowParams  		", JSON.stringify(rowParams, null, 4), "\n\n\n");
	rowParams.filterText = "";
	row = Alloy.createController("itemTemplates/".concat(rowParams.itemTemplate), rowParams);
	$.delDetailsSection.add(row.getView());

	data.push($.delDetailsSection);

	$.paymentDetailsSection = $.uihelper.createTableViewSection($, "Payment Details");

	var payment = {
		section : "paymentInfo",
		itemTemplate : "creditCardView",
		masterWidth : 100,
		title : paymentDetails.creditCardType + " " + Alloy.Globals.strings.checkoutCCEndingIn + " " + paymentDetails.lastFourDigit,
		subtitle : Alloy.Globals.strings.checkoutCCExpDate + " " + paymentDetails.expirationDate,
		showEditIcon : false
	};

	var rowParams1 = payment,
	    row1;

	rowParams1.filterText = _.values(_.pick(rowParams1, ["title", "subtitle"])).join(" ").toLowerCase();
	row1 = Alloy.createController("itemTemplates/".concat(rowParams1.itemTemplate), rowParams1);
	$.paymentDetailsSection.add(row1.getView());
	data.push($.paymentDetailsSection);

	///update table
	$.tableView.setData(data);

	/**
	 * cache the pickup mode for later use
	 */
	if (args.pickupMode) {
		// $.utilities.setProperty(Alloy.CFG.latest_pickup_mode, args.pickupMode);
	}
	/**
	 * this is a successful refill
	 * so cache phone number if available
	 */
	if (args.phone) {
		$.utilities.setProperty(Alloy.CFG.latest_phone_used, args.phone);
	}
}

function didClickStorePhone(e) {
	if (!Titanium.Contacts.hasContactsPermissions()) {
		Titanium.Contacts.requestContactsPermissions(function(result) {
			if (result.success) {
				contactsHandler();
			} else {
				$.analyticsHandler.trackEvent("QuickRefill-RefillSuccess", "click", "DeniedContactsPermission");
			}
		});
	} else {
		contactsHandler();
	}
}

function contactsHandler() {
	$.uihelper.getPhone({
		firstName : store.title,
		phone : {
			work : [store.phone_formatted]
		}
	}, store.phone);
}

function didClickSignup(e) {
	$.app.navigator.open({
		titleid : "titleCreateAccount",
		ctrl : "signup"
	});
}

function didClickDone(e) {
	$.app.navigator.open(Alloy.Collections.menuItems.findWhere({
		landing_page : true
	}).toJSON());
}

function handleEvent(e) {
	$.analyticsHandler.handleEvent($.ctrlShortCode, e);
}

exports.init = init;
exports.focus = focus;
