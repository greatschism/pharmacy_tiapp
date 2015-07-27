var args = arguments[0] || {},
    prescriptions = args.prescriptions || [],
    store;

function focus() {
	var isSuccess = _.findWhere(prescriptions, {
		refill_is_error : false
	}),
	    isFailure = _.findWhere(prescriptions, {
		refill_is_error : true
	});
	var tKey,
	    iKey,
	    lKey;
	if (isSuccess && isFailure) {
		//partial success
		tKey = "titleRefillSuccess";
		iKey = "success";
		lKey = "refillSuccessLblPartial";
	} else if (isSuccess) {
		//complete success
		tKey = "titleRefillSuccess";
		iKey = "success";
		lKey = "refillSuccessLblSuccess";
	} else {
		//complete failure
		tKey = "titleRefillFailure";
		lKey = "refillSuccessLblFailure";
	}
	$.setTitle($.strings[tKey]);
	if (iKey) {
		var dict = $.createStyle({
			classes : ["margin-top"]
		});
		_.extend(dict, $.uihelper.getImage(iKey));
		$.successImg.applyProperties(dict);
	}
	$.lbl.text = $.strings[lKey];
	var storeId = prescriptions[0].refill_store_id;
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
			feature_code : "THXXX",
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
		 */
		$.utilities.setProperty(Alloy.CFG.latest_store_refilled, store.id);
		var storeRow = Alloy.createController("itemTemplates/contentViewAttributed", store);
		storeRow.on("click", didClickStorePhone);
		$.pickupSection.add(storeRow.getView());
	}
	if (isMailOrder) {
		$.pickupSection.add(Alloy.createController("itemTemplates/label", {
			title : $.strings.refillSuccessLblMailOrder
		}).getView());
	}
	/**
	 *  tentative case we are contacting your doctor
	 *  is not handled as api doesn't have a unique
	 *  identifier yet for that case
	 */
	$.prescSection = $.uihelper.createTableViewSection($, $.strings.refillSuccessSectionPresc);
	var subtitleClasses = ["content-subtitle-wrap"],
	    successClasses = ["margin-top", "content-positive-left-icon", "icon-checkbox"],
	    failureClasses = ["margin-top", "content-negative-left-icon", "icon-close"];
	_.each(prescriptions, function(prescription) {
		_.extend(prescription, {
			subtitleClasses : subtitleClasses,
			iconClasses : prescription.refill_is_error === true ? failureClasses : successClasses
		});
		$.prescSection.add(Alloy.createController("itemTemplates/contentViewWithLIcon", prescription).getView());
	});
	data.push($.prescSection);

	///update table
	$.tableView.setData(data);

	/**
	 * this is a successful refill
	 * so store phone number if available
	 */
	if (args.phone) {
		$.utilities.setProperty(Alloy.CFG.latest_phone_used, args.phone);
	}
}

function didClickStorePhone(e) {
	$.uihelper.getPhone({
		firstName : store.title,
		phone : {
			work : [store.phone_formatted]
		}
	}, store.phone);
}

function didClickSignup(e) {
	$.app.navigator.open({
		titleid : "titleSignup",
		ctrl : "signup"
	});
}

function didClickDone(e) {
	$.app.navigator.open(Alloy.Collections.menuItems.findWhere({
		landing_page : true
	}).toJSON());
}

exports.focus = focus;
