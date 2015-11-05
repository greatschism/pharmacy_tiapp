var args = arguments[0] || {},
    rx = require("rx"),
    apiCodes = Alloy.CFG.apiCodes,
    rxTxts = [$.rxTxt],

/***PHA-1250***/
/*rightIconText = $.createStyle({
 classes : ["icon-unfilled-remove"]
 }).text,
 rightIconDict = $.createStyle({
 classes : ["txt-negative-right-icon"],
 touchEnabled : true
 }),*/
    rightIconDict = $.createStyle({
	classes : ["txt-negative-right-icon"],
	title : $.createStyle({
		classes : ["icon-unfilled-remove"]
	}).text,
	touchEnabled : true,
	id : "removeBtn"
}),
/***PHA-1250***/

    store = _.omit(args.store || {}, ["shouldUpdate"]),
    rxTxtHeight,
    phone,
    isWindowOpen;

function init() {
	$.uihelper.getImage("success", $.successImg);
	/***PHA-1250***/
	$.rxTxt.setRightIcon("", $.createStyle({
		classes : ["txt-tertiary-right-icon"],
		title : $.createStyle({
			classes : ["icon-help"]
		}).text,
		touchEnabled : true,
		id : "sampleBtn"
	}));
	/***PHA-1250***/
	rxTxtHeight = $.createStyle({
		classes : ["txt"]
	}).height + $.createStyle({
		classes : ["margin-top"]
	}).top;
	$.containerView.height = rxTxtHeight;
	/**
	 * only when phoneTxt
	 * is included
	 * determined by flag refill_type_phone_enabled
	 * from theme
	 */
	if ($.phoneTxt) {
		/**
		 * args.phone - phone number entered from
		 * refillPhone screen reached here
		 * through refill failure
		 * if not check for last used phone
		 */
		var lastPhone = args.phone || $.utilities.getProperty(Alloy.CFG.latest_phone_used);
		if (lastPhone) {
			$.phoneTxt.setValue($.utilities.formatPhoneNumber(lastPhone));
		}
	}
}

function didChange(e) {
	var value = $.utilities.formatPhoneNumber(e.value),
	    len = value.length;
	$.phoneTxt.setValue(value);
	$.phoneTxt.setSelection(len, len);
}

/**
 * calculating height to give minimum load to
 * layout engine
 */
function didClickAdd(e) {
	var len = rxTxts.length;
	$.containerView.height = (rxTxtHeight * (len + 1));
	//PHA-1250
	/*if (len === 1) {
	 _.extend(rightIconDict, {
	 title : rightIconText,
	 touchEnabled : true
	 });
	 rxTxts[0].setRightIcon("", rightIconDict);
	 }*/
	var ctrl = Alloy.createController("templates/rxTxtWithRIcon");
	ctrl.setRightIcon("", rightIconDict);
	ctrl.on("click", didClickRemove);
	/**
	 *  ctrl.getView() will be ti.textfield widget
	 *  so used ctrl.getView().getView()
	 */
	$.containerView.add(ctrl.getView().getView());
	rxTxts.push(ctrl);
}

function didClickRemove(e) {
	/**
	 * length after removing one text field
	 * length - 1
	 */
	var len = rxTxts.length - 1,
	    widgetToRemove = e.source.getView();
	$.containerView.height = rxTxtHeight * len;
	rxTxts = _.reject(rxTxts, function(widget) {
		if (widget.getView().getView() == widgetToRemove) {
			return true;
		}
		return false;
	});
	$.containerView.remove(widgetToRemove);
	//PHA-1250
	/*if (len == 1) {
	 _.extend(rightIconDict, {
	 title : "",
	 touchEnabled : false
	 });
	 rxTxts[0].setRightIcon("", rightIconDict);
	 }*/
}

function didClickRefill(e) {
	/**
	 * process rx numbers
	 * empty rx fields can be ignored
	 * need not to show errors
	 * and should have at least one valid rx
	 */
	var pickupMode = Alloy.Models.pickupModes.get("selected_code_value"),
	    storeId = pickupMode == apiCodes.pickup_mode_mail_order ? Alloy.Models.appload.get("mail_order_store_id") : store.id,
	    isInvalidRx = false,
	    lastIndex = 0,
	    validRxs = [];
	_.some(rxTxts, function(rxTxt, index) {
		var value = rxTxt.getValue();
		if (value) {
			value = rx.validate(value);
			if (value) {
				validRxs.push({
					rx_number : value,
					store_id : storeId,
					pickup_mode : pickupMode,
					pickup_time_group : apiCodes.pickup_time_group_asap
				});
			} else {
				lastIndex = index;
				isInvalidRx = true;
				return true;
			}
		}
		return false;
	});
	if (isInvalidRx || validRxs.length === 0) {
		$.uihelper.showDialog({
			message : $.strings.refillTypeValRx,
			success : function() {
				rxTxts[lastIndex].getView().focus();
			}
		});
		return false;
	}
	if ($.phoneTxt) {
		phone = $.phoneTxt.getValue();
		if (!phone) {
			$.uihelper.showDialog({
				message : $.strings.refillTypeValPhone
			});
			return false;
		}
		phone = $.utilities.validatePhoneNumber(phone);
		if (!phone) {
			$.uihelper.showDialog({
				message : $.strings.refillTypeValPhoneInvalid
			});
			return false;
		}
		_.each(validRxs, function(validRx) {
			validRx.mobile_number = phone;
		});
	}
	/**
	 * store validated here
	 * just to follow the same order on UI
	 */
	if (!storeId) {
		$.uihelper.showDialog({
			message : $.strings.refillTypeValStore
		});
		return false;
	}
	$.http.request({
		method : "prescriptions_refill",
		params : {
			filter : {
				refill_type : apiCodes.refill_type_quick
			},
			data : [{
				prescriptions : validRxs
			}]
		},
		passthrough : validRxs,
		success : didRefill
	});
}

function didRefill(result, passthrough) {
	/**
	 * passthrough will have the valid rx numbers
	 * the same we sent to api
	 */
	var prescriptions = result.data.prescriptions;
	_.each(prescriptions, function(prescription, index) {
		_.extend(prescription, {
			title : $.strings.strPrefixRx.concat(passthrough[index].rx_number.substring(Alloy.CFG.rx_start_index, Alloy.CFG.rx_end_index)),
			subtitle : prescription.refill_inline_message || prescription.refill_error_message
		});
	});
	$.app.navigator.open({
		ctrl : "refillSuccess",
		ctrlArguments : {
			prescriptions : prescriptions,
			pickupMode : Alloy.Models.pickupModes.get("selected_code_value"),
			phone : phone
		}
	});
}

function didClickEdit(e) {
	$.app.navigator.open({
		titleid : "titleStores",
		ctrl : "stores",
		ctrlArguments : {
			store : store,
			selectable : true,
			mailOrderStoreEnabled : false
		},
		stack : true
	});
}

function focus() {
	if (!isWindowOpen) {
		isWindowOpen = true;
		getStore();
	} else if (store.shouldUpdate) {
		/**
		 * new store has been picked up
		 * reset the update flag
		 */
		store.shouldUpdate = false;
		updateStore();
	}
}

function didFail(result, passthrough) {
	/**
	 * if something goes odd with api
	 * just close this screen to
	 * prevent any further actions
	 */
	$.app.navigator.hideLoader();
	$.app.navigator.close();
}

function getStore() {
	var storeId = $.utilities.getProperty(Alloy.CFG.latest_store_refilled);
	if (_.isEmpty(store) && storeId) {
		$.http.request({
			method : "stores_get",
			params : {
				data : [{
					stores : {
						id : storeId,
					}
				}]
			},
			keepLoader : Alloy.Models.pickupModes.get("code_values") ? false : true,
			success : didGetStore,
			failure : didFail
		});
	} else {
		getOrSetPickupModes();
	}
}

function didGetStore(result, passthrough) {
	/**
	 * update properties to object
	 * don't replace, if then might clear the reference
	 * when passed through the controllers
	 */
	_.extend(store, result.data.stores);
	_.extend(store, {
		title : $.utilities.ucword(store.addressline1),
		subtitle : $.utilities.ucword(store.city) + ", " + store.state + ", " + store.zip
	});
	getOrSetPickupModes();
}

function getOrSetPickupModes() {
	if (Alloy.Models.pickupModes.get("code_values")) {
		setPickupModes();
	} else {
		getPickupModes();
	}
}

function getPickupModes() {
	$.http.request({
		method : "codes_get",
		params : {
			data : [{
				codes : [{
					code_name : apiCodes.code_pickup_modes
				}]
			}]
		},
		success : didGetPickupModes,
		failure : didFail
	});
}

function didGetPickupModes(result, passthrough) {
	Alloy.Models.pickupModes.set(result.data.codes[0]);
	setPickupModes();
}

function setPickupModes() {
	var codes = Alloy.Models.pickupModes.get("code_values"),
	    defaultVal = $.utilities.getProperty(Alloy.CFG.latest_pickup_mode, Alloy.Models.pickupModes.get("default_value")),
	    selectedCode;
	/**
	 * if defaultVal in store pickup
	 * then make sure the given store supports
	 * the same
	 */
	if (defaultVal == apiCodes.pickup_mode_instore && store.id == Alloy.Models.appload.get("mail_order_store_id") && !Alloy.CFG.mail_order_store_pickup_enabled) {
		defaultVal = apiCodes.pickup_mode_mail_order;
	}
	//update selected value
	_.each(codes, function(code) {
		if (code.code_value === defaultVal) {
			selectedCode = code;
			code.selected = true;
		} else {
			code.selected = false;
		}
	});
	//update selected value
	Alloy.Models.pickupModes.set("selected_code_value", selectedCode.code_value);
	/**
	 * if there are more then one option populate picker
	 * otherwise just show the default option
	 * if only one pickup option then
	 * don't show option to change
	 */
	if (codes.length > 1) {
		$.pickupModePicker.setItems(codes);
		updatePickupMode({
			data : selectedCode
		});
	} else {
		$.pickupView.remove($.pickupModeView);
		$.pickupView.remove($.pickupDividerView);
		$.pickupModeView = null;
		$.pickupDividerView = null;
		updatePickupOption();
	}
}

function updatePickupMode(e) {
	Alloy.Models.pickupModes.set("selected_code_value", e.data.code_value);
	$.pickupModeLbl.text = e.data.code_display;
	updatePickupOption();
}

function updatePickupOption() {
	switch(Alloy.Models.pickupModes.get("selected_code_value")) {
	case apiCodes.pickup_mode_instore:
		/**
		 * check whether the store supports
		 * instore pickup
		 */
		if (store.id == Alloy.Models.appload.get("mail_order_store_id") && !Alloy.CFG.mail_order_store_pickup_enabled) {
			store = {};
		}
		//update store
		updateStore();
		//update correspondent views
		if ($.mailorderView.visible) {
			$.pickupView.remove($.mailorderView);
			$.mailorderView.visible = false;
		}
		if (!$.storeView.visible) {
			$.storeView.visible = true;
			$.pickupView.add($.storeView);
		}
		break;
	case apiCodes.pickup_mode_mail_order:
		if ($.storeView.visible) {
			$.pickupView.remove($.storeView);
			$.storeView.visible = false;
		}
		if (!$.mailorderView.visible) {
			$.mailorderView.visible = true;
			$.pickupView.add($.mailorderView);
		}
		break;
	}
}

function updateStore() {
	$.storeTitleLbl.text = store.title || $.strings.refillTypeLblStoreTitle;
	$.storeSubtitleLbl.text = store.subtitle || $.strings.refillTypeLblStoreSubtitle;
}

function didClickPickupModeClose(e) {
	$.pickupModePicker.hide();
}

function didClickPickupMode(e) {
	$.pickupModePicker.show();
}

function didClickHelp(e) {
	$.app.navigator.open({
		titleid : "titleRxSample",
		ctrl : "rxSample",
		stack : true
	});
}

function hideAllPopups() {
	if ($.pickupModePicker && $.pickupModePicker.getVisible()) {
		return $.pickupModePicker.hide();
	}
	return false;
}

exports.init = init;
exports.focus = focus;
exports.backButtonHandler = hideAllPopups;
