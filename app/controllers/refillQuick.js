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
    store = {},
    rxTxtHeight,
    isWindowOpen;

function init() {
	rxTxtHeight = $.createStyle({
		classes : ["txt"]
	}).height + $.createStyle({
		classes : ["margin-top"]
	}).top;
	$.containerView.height = rxTxtHeight;
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

function didClickOrder(e) {
	//process store
	if (_.isEmpty(store)) {
		$.uihelper.showDialog({
			message : $.strings.refillQuickMsgStoreNoneSelected
		});
		return false;
	}
	//process rx numbers
	var validRxs = [];
	_.some(rxTxts, function(rxTxt) {
		var value = rxTxt.getValue();
		if (value) {
			validRxs.push({
				rx_number : value,
				store_id : store.id,
				pickup_mode : apiCodes.pickup_mode_instore,
				pickup_time_group : apiCodes.pickup_time_group_asap
			});
			return false;
		}
		return true;
	});
	var validLen = validRxs.length;
	if (validLen != rxTxts.length) {
		$.uihelper.showDialog({
			message : $.strings.refillQuickMsgRxInvalid,
			success : function() {
				rxTxts[validLen].getView().focus();
			}
		});
		return false;
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
	var prescriptions = result.data.prescriptions,
	    isPartial = false;
	_.each(prescriptions, function(prescription, index) {
		if (!isPartial && prescription.refill_is_error === "true") {
			isPartial = true;
		}
		_.extend(prescription, {
			title : $.strings.strPrefixRx.concat(passthrough[index].rx_number.substring(Alloy.CFG.rx_start_index, Alloy.CFG.rx_end_index)),
			subtitle : prescription.refill_inline_message || prescription.refill_error_message
		});
	});
	$.app.navigator.open({
		titleid : "titleRefillSuccess",
		ctrl : "refillSuccess",
		ctrlArguments : {
			prescriptions : prescriptions,
			isPartial : isPartial
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
			$.storeTitleLbl.text = $.strings.refillQuickLblStoreTitle;
			$.storeSubtitleLbl.text = $.strings.refillQuickLblStoreSubtitle;
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
}

exports.init = init;
exports.focus = focus;
