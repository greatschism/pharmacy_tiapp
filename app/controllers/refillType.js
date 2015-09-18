var args = arguments[0] || {},
    apiCodes = Alloy.CFG.apiCodes,
    rxTxts = [$.rxTxt],
    rightIconText = $.createStyle({
	classes : ["icon-unfilled-remove"]
}).text,
    rightIconDict = $.createStyle({
	classes : ["txt-negative-right-icon"],
	touchEnabled : true
}),
    store = _.clone(args.store || {}),
    rxTxtHeight,
    phone,
    isWindowOpen;

function init() {
	$.uihelper.getImage("success", $.successImg);
	rxTxtHeight = $.createStyle({
		classes : ["txt"]
	}).height + $.createStyle({
		classes : ["margin-top"]
	}).top;
	$.containerView.height = rxTxtHeight;
	/**
	 *  if any bookmark operation
	 *  was performed on this store
	 *  at details screen shouldUpdate will be true
	 *  when user reaches this screen.
	 *  So just set it to false
	 *  by default
	 */
	if (store.shouldUpdate) {
		store.shouldUpdate = false;
	}
	var codes = Alloy.Models.pickupModes.get("code_values") || [],
	    len = codes.length;
	if (len === 0 || len > 1) {
		var title;
		if (len) {
			/**
			 * check if a prefered pickup mode
			 * is sent with arguments
			 * Note: need to check only when
			 * more than one option is available
			 */
			var preferedPickupMode = args.pickupMode;
			if (preferedPickupMode) {
				_.each(codes, function(code) {
					if (code.code_value == preferedPickupMode) {
						Alloy.Models.pickupModes.set("selected_code_value", code.code_value);
						code.selected = true;
					} else {
						code.selected = false;
					}
				});
			}
			$.pickupModePicker.setItems(codes);
			title = _.findWhere(codes, {
				selected : true
			}).code_display;
		} else {
			title = $.strings.strLoading;
		}
		$.pickupModeLbl.text = title;
		$.pickupView.add($.pickupModeView);
		$.pickupView.add($.pickupDividerView);
	}
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
	if (len === 1) {
		_.extend(rightIconDict, {
			title : rightIconText,
			touchEnabled : true
		});
		rxTxts[0].setRightIcon("", rightIconDict);
	}
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
	if (len == 1) {
		_.extend(rightIconDict, {
			title : "",
			touchEnabled : false
		});
		rxTxts[0].setRightIcon("", rightIconDict);
	}
}

function didClickRefill(e) {
	//process store
	if (_.isEmpty(store)) {
		$.uihelper.showDialog({
			message : $.strings.refillTypeValStore
		});
		return false;
	}
	/**
	 * process rx numbers
	 * empty rx fields can be ignored
	 * need not to show errors
	 * and should have at least one valid rx
	 */
	var pickupMode = Alloy.Models.pickupModes.get("selected_code_value"),
	    storeId = pickupMode == apiCodes.pickup_mode_instore ? store.id : Alloy.Models.appload.get("mail_order_store_id"),
	    isInvalidRx = false,
	    lastIndex = 0,
	    validRxs = [];
	_.some(rxTxts, function(rxTxt, index) {
		var value = rxTxt.getValue();
		if (value) {
			value = $.utilities.validateRx(value);
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
			return;
		}
		phone = $.utilities.validatePhoneNumber(phone);
		if (!phone) {
			$.uihelper.showDialog({
				message : $.strings.refillTypeValPhoneInvalid
			});
			return;
		}
		_.each(validRxs, function(validRx) {
			validRx.mobile_number = phone;
		});
	}
	$.http.request({
		method : "prescriptions_refill",
		params : {
			feature_code : "THXXX",
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
			selectable : true
		},
		stack : true
	});
}

function focus() {
	if (!isWindowOpen) {
		isWindowOpen = true;
		var codes = Alloy.Models.pickupModes.get("code_values");
		if (codes) {
			/**
			 * codes are already available
			 * proceed further
			 *
			 * if only one pickup option then
			 * don't show option to change
			 */
			getStore();
		} else {
			/**
			 * this is the first launch of this screen
			 * get stores information
			 */
			getPickupModes();
		}
	} else if (store.shouldUpdate) {
		/**
		 * new store has been picked up
		 * reset the update flag
		 */
		store.shouldUpdate = false;
		updateStore();
	}
}

function getPickupModes() {
	/**
	 * if we don't have store information already
	 *  _.isEmpty(store) = true then keepLoader will be true
	 * as there will be subsequent api call for prescription and store
	 * otherwise it will be just pickup mode
	 */
	$.http.request({
		method : "codes_get",
		params : {
			feature_code : "THXXX",
			data : [{
				codes : [{
					code_name : apiCodes.code_pickup_modes
				}]
			}]
		},
		keepLoader : _.isEmpty(store),
		success : didGetPickupModes,
		failure : didFail
	});
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

function didGetPickupModes(result) {
	/**
	 * args.pickupMode is prefered pickup mode
	 * for this transaction, if nothing set as such
	 * check for the latest_pickup_mode used in cache,
	 * incase of first use, set the default
	 * i.e: if we reach this screen from store details
	 * then prefered pickup mode will be pickup_mode_instore
	 * if default is mail order then we have to
	 * give first pererence for args.pickupMode
	 */
	Alloy.Models.pickupModes.set(result.data.codes[0]);
	var codes = Alloy.Models.pickupModes.get("code_values"),
	    defaultVal = args.pickupMode || $.utilities.getProperty(Alloy.CFG.latest_pickup_mode, Alloy.Models.pickupModes.get("default_value")),
	    selectedCode;
	_.each(codes, function(code) {
		if (code.code_value === defaultVal) {
			selectedCode = code;
			code.selected = true;
		} else {
			code.selected = false;
		}
	});
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
		$.pickupView.remove($.storeDividerView);
		$.pickupModeView = null;
		$.storeDividerView = null;
	}
	getStore();
}

function getStore() {
	if (_.isEmpty(store)) {
		//last refilled store
		var storeId = $.utilities.getProperty(Alloy.CFG.latest_store_refilled);
		if (storeId) {
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
			$.storeTitleLbl.text = $.strings.refillTypeLblStoreTitle;
			$.storeSubtitleLbl.text = $.strings.refillTypeLblStoreSubtitle;
			updatePickupOption();
			$.app.navigator.hideLoader();
		}
	} else {
		/**
		 * store exists might have
		 * passed from store details
		 */
		updateStore();
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
	updateStore();
}

function updateStore() {
	$.storeTitleLbl.text = store.title;
	$.storeSubtitleLbl.text = store.subtitle;
	updatePickupOption();
}

function updatePickupMode(e) {
	Alloy.Models.pickupModes.set("selected_code_value", e.data.code_value);
	$.pickupModeLbl.text = e.data.code_display;
	updatePickupOption();
}

function updatePickupOption() {
	switch(Alloy.Models.pickupModes.get("selected_code_value")) {
	case apiCodes.pickup_mode_instore:
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
