var args = $.args,
    prescriptions = args.prescriptions || [],
    store,
    fromInsurance = args.fromInsurance;

function init() {

	if (fromInsurance) {
		$.lblContact.text = args.resultMessage;
		$.window.title = "Success";
		$.lbl.height = 0;
		$.img.applyProperties($.createStyle({
			classes : ["margin-top-large", "margin-bottom-extra-large", "img-success"]
		}));
		return;
	}
	var isSuccess = _.findWhere(prescriptions, {
		refill_is_error : false
	}),
	    isFailure = _.findWhere(prescriptions, {
		refill_is_error : true
	});
	var tKey,
	    iKey,
	    lKey;
	isSuccess = true;
	isFailure = false;
	if (isSuccess && isFailure) {
		//partial success
		tKey = "titleRefillSuccess";
		iKey = "img-success";
		lKey = "refillSuccessLblPartial";
	} else if (isSuccess) {
		//complete success
		tKey = "titleRefillSuccess";
		iKey = "img-success";
		lKey = "refillSuccessLblSuccess";
	} else {
		//complete failure
		tKey = "titleRefillFailure";
		lKey = "refillSuccessLblFailure";
	}
	/**
	 * Note: window is yet to be opened,
	 * actionBar / setTitle will not be
	 * available here at init
	 */
	$.window.title = $.strings[tKey];
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
	if (!fromInsurance) {
		var storeId = prescriptions[0].refill_store_id;
		if (storeId) {
			getStore(storeId);
		} else {
			updateTable();
		}
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
	var successClasses = ["positive-fg-color", "icon-checkbox"],
	    failureClasses = ["negative-fg-color", "icon-cancel"];
	_.each(prescriptions, function(prescription) {
		_.extend(prescription, {
			iconClasses : prescription.refill_is_error === true ? failureClasses : successClasses
		});
		$.prescSection.add(Alloy.createController("itemTemplates/contentViewWithLIcon", prescription).getView());
	});
	data.push($.prescSection);

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
		titleid : "searchExistingPatientWelcome",
		ctrl : "searchExistingPatient"
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
