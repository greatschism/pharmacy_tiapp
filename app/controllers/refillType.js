var args = $.args,
	logger = require("logger"),
	uihelper = require("uihelper"),
    rx = require("rx"),
    apiCodes = Alloy.CFG.apiCodes,
    rxTxts = [$.rxTxt],
    rightIconDict = $.createStyle({
	classes : ["margin-right-small", "i5", "negative-fg-color", "bg-color-disabled", "touch-enabled", "icon-unfilled-remove"],
	id : "removeBtn"
}),
    store = _.omit(args.store || {}, ["shouldUpdate"]),
    rxTxtHeight,
    phone,
    isWindowOpen,
    analyticsCategory; 

function init() {
	analyticsCategory = require("moduleNames")[$.ctrlShortCode] + "-" + require("ctrlNames")[$.ctrlShortCode];
	$.rxTxt.setRightIcon("", $.createStyle({
		classes : ["margin-right-small", "i5", "active-fg-color", "bg-color-disabled", "touch-enabled", "icon-help"],
		id : "sampleBtn"
	}));
	rxTxtHeight = $.createStyle({
		classes : ["txt"]
	}).height + $.createStyle({
		classes : ["margin-top"]
	}).top;
	$.containerView.height = rxTxtHeight;
	$.uihelper.wrapViews($.pickupModeView, "right");
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
	$.analyticsHandler.trackEvent(analyticsCategory, "click", "RemoveBtn");
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
}

function didClickRefill(e) {
	/**
	 * process rx numbers
	 * empty rx fields can be ignored
	 * need not to show errors
	 * and should have at least one valid rx
	 */
	var pickupMode = Alloy.Models.pickupModes.get("selected_code_value"),
	    // storeId = pickupMode == apiCodes.pickup_mode_mail_order ? Alloy.Models.appload.get("mail_order_store_id") : store.id,
	    
	    storeId = store.id,

	    isInvalidRx = false,
	    lastIndex = 0,
	    validRxs = [];
	    
	    
	    logger.debug("\n\n\n\n selected store id : ", storeId,"\n\n pickupmode : ",pickupMode);
	    
	    if( (Alloy.Models.appload.get("mail_order_store_id") > 0 ) && (pickupMode == apiCodes.pickup_mode_mail_order))
	    {
	    	storeId = Alloy.Models.appload.get("mail_order_store_id");
	    }
	    
	_.some(rxTxts, function(rxTxt, index) {
		var value = rxTxt.getValue();
		if (value) {
			value = rx.validate(value);
			if (value) {
				//PHA-1424
				validRxs.push({
					rx_number : value.substring(Alloy.CFG.rx_start_index, Alloy.CFG.rx_end_index),
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
			message : String.format($.strings.refillTypeValRx, Alloy.CFG.rx_length),
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
	var prescriptions = result.data.prescriptions,
	    hasSuccess = false;
	_.each(prescriptions, function(prescription, index) {
		_.extend(prescription, {
			title : $.strings.strPrefixRx.concat(passthrough[index].rx_number),
			subtitle : prescription.refill_inline_message || prescription.refill_error_message
		});
		if (!hasSuccess && !prescription.refill_is_error) {
			hasSuccess = true;
		}
	});
	/**
	 * show signup option
	 * only if not logged in and
	 * refill is not failure (success / partial success)
	 */
	$.app.navigator.open({
		ctrl : "refillSuccess",
		titleid : "titleRefillOrdered",
		ctrlArguments : {
			prescriptions : prescriptions,
			pickupMode : Alloy.Models.pickupModes.get("selected_code_value"),
			signupEnabled : !Alloy.Globals.isLoggedIn && hasSuccess,
			phone : phone
		},
		stack : true
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
		if ((!(_.isEmpty(store))) && store.id) 
		{
			logger.debug("\n\n\n came into refill screen - get store call \n\n\n");
			logger.debug("\n\n\n selected store details \n\n\n", JSON.stringify(store,null,4));

			getStore();

		}

		else
		{
			logger.debug("\n\n\n came into refill screen - getAllPharmacy call \n\n\n");

			getAllPharmacy();
		}

	} else if (store.shouldUpdate) {
		/**
		 * new store has been picked up
		 * reset the update flag
		 */
		store.shouldUpdate = false;
		updateStore();
		logger.debug("\n\n\n calling update store \n\n\n");

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
	if (_.isEmpty(store) && store.id) {
		$.http.request({
			method : "stores_get",
			params : {
				data : [{
					stores : {
						id : store.id,
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

function getAllPharmacy() {
	/**
	 *step 1: get the stores, step 2: Identify the home pharmacy, step 3: get store details for home pharmacy
	 */
	$.http.request({
		method : "stores_list",
		params : {
			data : [{
				stores : {
					search_criteria : "",
					user_lat : "",
					user_long : "",
					search_lat : "",
					search_long : "",
					view_type : "LIST"
				}
			}]
		},
		errorDialogEnabled : false,
		success : getHomePharmacy,
		failure : didGetNoStore
	});
}

function didGetNoStore()
{
				getOrSetPickupModes();

}

function getHomePharmacy(result) {
	// var storeId = $.utilities.getProperty(Alloy.CFG.latest_store_refilled);
	// if (_.isEmpty(store) && storeId) {
		
		if (Alloy.Globals.isLoggedIn)
		{
			_.each(result.data.stores.stores_list, function(store) {
				if (parseInt(store.ishomepharmacy)) {
					$.http.request({
						method : "stores_get",
						params : {
							data : [{
								stores : {
									id : store.id,
								}
							}]
						},
						keepLoader : Alloy.Models.pickupModes.get("code_values") ? false : true,
						success : didGetStore,
						failure : didFail
					});
				}
			});
		} 
		else 
		{
			getOrSetPickupModes();
		}
}

function didGetStore(result, passthrough) {
	logger.debug("\n\n\n in didgetstore result", JSON.stringify(result,null,4), "\n\n\n");
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
		logger.debug("\n\n\n in didgetstore store obj", JSON.stringify(store,null,4), "\n\n\n");

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
	logger.debug("\n\n\n Alloy.CFG.latest_pickup_mode = ", Alloy.CFG.latest_pickup_mode, "\n\n\n");

	var codes = Alloy.Models.pickupModes.get("code_values"),
	    defaultVal = $.utilities.getProperty(Alloy.CFG.latest_pickup_mode, Alloy.Models.pickupModes.get("default_value")),
	    selectedCode;
	  	logger.debug("\n\n\n code_values", JSON.stringify(codes),"\n\n\n");
  
	logger.debug("\n\n\n Alloy.CFG.latest_pickup_mode from api= ", Alloy.CFG.latest_pickup_mode, "\n\n\n");

	/**
	 * if defaultVal in store pickup
	 * then make sure the given store supports
	 * the same
	 */
	// if (defaultVal == apiCodes.pickup_mode_instore && store.id == Alloy.Models.appload.get("mail_order_store_id") && !Alloy.CFG.mail_order_store_pickup_enabled) {
		// defaultVal = apiCodes.pickup_mode_mail_order;
	// }
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

function showHideOptions()
{
	// use 		 if (Alloy.Models.appload.get("mail_order_store_id")) 

	var codes = Alloy.Models.pickupModes.get("code_values");
	
	logger.debug("\n\n\n code_values", JSON.stringify(codes),"\n\n\n");
	
	switch(Alloy.Models.pickupModes.get("selected_code_value")) {
	case apiCodes.pickup_mode_instore:
		/**
		 * check whether the store supports
		 * instore pickup
		 */
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

function updatePickupOption() {
	
	// PHA-2600  -- enhancement - multiple mail order support


	switch(Alloy.Models.pickupModes.get("selected_code_value")) {
	case apiCodes.pickup_mode_instore:
		/**
		 * check whether the store supports
		 * instore pickup
		 */
			
			if(Alloy.Globals.isMailOrderService)
			{
				store = {};
				// if inside login, call home pharmacy
			}
		Alloy.Globals.isMailOrderService = false;
		var ishomepharmacy = parseInt(store.ishomepharmacy) || 0;
		if(ishomepharmacy == 0)
		// if ( !Alloy.CFG.mail_order_store_pickup_enabled) 
		{
			// store = {};
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
		$.pickupLbl.text = Alloy.Globals.strings.refillTypeSectionPickup;
		break;
	case apiCodes.pickup_mode_mail_order:
		Alloy.Globals.isMailOrderService = true;
		store = {};

		if(Alloy.Models.appload.get("mail_order_store_id") > 0)
		{
			if ($.storeView.visible) {
				$.pickupView.remove($.storeView);
				$.storeView.visible = false;
			}
			if (!$.mailorderView.visible) {
				$.mailorderView.visible = true;
				$.pickupView.add($.mailorderView);
			}
					
			$.pickupLbl.text = Alloy.Globals.strings.refillTypeSectionMail;

		}

		else
		{
			if(Alloy.Globals.isLoggedIn && Alloy.Globals.isMailOrderService)
			{
					mailOrderCall();
		
			}
			else
			{
					updateStore();
	
			}
		
	
			if ($.mailorderView.visible) {
				$.pickupView.remove($.mailorderView);
				$.mailorderView.visible = false;
			}
			if (!$.storeView.visible) {
				$.storeView.visible = true;
				$.pickupView.add($.storeView);
			}
			
			$.pickupLbl.text = Alloy.Globals.strings.refillTypeSectionMail;
	
			// if ($.storeView.visible) {
				// $.pickupView.remove($.storeView);
				// $.storeView.visible = false;
			// }
			// if (!$.mailorderView.visible) {
				// $.mailorderView.visible = true;
				// $.pickupView.add($.mailorderView);
			// }
		}
		break;
	}
}


function mailOrderCall()
{
	httpClient = $.http.request({
				method : "mailorder_stores_get",
				params : {
					data : [{
							rx_info : {
			       				rx_number: ""
		     				}
					}],
					feature_code : "IP-STLI-STOR"
				},
				passthrough : true ,
				errorDialogEnabled :  true,
				showLoader : false,
				success : didGetMailOrderStores,
				failure : didGetMailOrderStores
				});
}

function didGetMailOrderStores(result, passthrough) {

	/**
	 * reset http client to ensure no pending api
	 */
	httpClient = null;

	/*
	 * handle failure cases
	 */
	if (!result.data) {
		logger.debug("\n\n\ndidgetstores -- results list empty\n\n\n");
		
		//this resets the list populated already
		result.data = {
			stores : {
				stores_list : []
			}
		};
	}

	var isLastFilled = parseInt(result.data.isLastFilled) || 0;
	logger.debug("\n\n\n lastfilled ", isLastFilled);

	if(isLastFilled === 1)
	{
		_.extend(store, result.data.stores.stores_list[0]);
		_.extend(store, {
			title : $.utilities.ucword(store.addressline1),
			subtitle : $.utilities.ucword(store.city) + ", " + store.state + ", " + store.zip
		});
	
	
		// _.each(result.data.stores.stores_list, function(store) {
			// _.extend(store, {
			// title : $.utilities.ucword(store.addressline1),
			// subtitle : $.utilities.ucword(store.city) + ", " + store.state + ", " + store.zip
		// });
	//});
	logger.debug("\n\n\n store last filled\n ",JSON.stringify(result.data.stores.stores_list[0], null, 4));

	}
		updateStore();
		logger.debug("\n\n\n update store for store\n", JSON.stringify(store, null, 4));
	
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
	$.analyticsHandler.trackEvent(analyticsCategory, "click", "HelpBtn");
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