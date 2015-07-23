var args = arguments[0] || {},
    prescriptions = args.prescriptions || [],
    store = args.store;

function init() {
	$.uihelper.getImage("success", $.successImg);
	/**
	 * this is a successful refill
	 * so store phone number if available
	 */
	if (args.phone) {
		$.utilities.setProperty(Alloy.CFG.latest_phone_used, phone);
	}
}

function focus() {
	/**
	 *  prescriptions length should not be zero
	 *  at this screen
	 */
	var storeId = prescriptions[0].refill_store_id;
	if (_.isEmpty(store) || store.id != storeId) {
		$.http.request({
			method : "stores_get",
			params : {
				feature_code : "THXXX",
				data : [{
					stores : {
						id : storeId,
					}
				}]
			},
			success : didGetStore
		});
	} else {
		updateTable();
	}
}

function didGetStore(result, passthrough) {
	store = result.data.stores;
	_.extend(store, {
		title : $.utilities.ucword(store.addressline1),
		subtitle : $.utilities.ucword(store.city) + ", " + store.state + ", " + store.zip
	});
	updateTable();
}

function updateTable() {
	/**
	 * update store attributed property
	 * will not be available
	 */
	store.attributed = String.format($.strings.attrPhone, store.phone_formatted || $.utilities.formatPhoneNumber(store.phone));
	/**
	 * this is a successful refill
	 * so store last used store id
	 */
	$.utilities.setProperty(Alloy.CFG.latest_store_refilled, store.id);
	/**
	 * process table
	 */
	$.pickupSection = $.uihelper.createTableViewSection($, $.strings.refillSuccessSectionPickup);
	var storeRow = Alloy.createController("itemTemplates/contentViewAttributed", store);
	storeRow.on("click", didClickStorePhone);
	$.pickupSection.add(storeRow.getView());
	/**
	 *  tentative case we are contacting your doctor
	 *  is not handled as api doesn't have a unique
	 *  identifier yet for that case
	 */
	$.prescSection = $.uihelper.createTableViewSection($, $.strings.refillSuccessSectionPresc);
	var subtitleClasses = ["content-subtitle-wrap"],
	    successClasses = ["content-positive-left-icon", "icon-checkbox"],
	    failureClasses = ["content-negative-left-icon", "icon-close"];
	_.each(prescriptions, function(prescription) {
		_.extend(prescription, {
			subtitleClasses : subtitleClasses,
			iconClasses : prescription.refill_is_error === "true" ? failureClasses : successClasses
		});
		$.prescSection.add(Alloy.createController("itemTemplates/contentViewWithLIcon", prescription).getView());
	});
	$.tableView.setData([$.pickupSection, $.prescSection]);
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

exports.init = init;
exports.focus = focus;
