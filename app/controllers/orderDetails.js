/**
 * clone store object
 * updating this store object later
 * should not affect the previous screen
 */
var args = $.args,
    apiCodes = Alloy.CFG.apiCodes,
    rows = [],
    store = _.omit(args.store || {}, ["shouldUpdate"]),
    prescriptions = args.prescriptions || [],
    selectedPrescriptions = [],
    nonRemovableDict = {
	masterWidth : 100,
	detailWidth : 0,
	btnClasses : false
},
    removableDict = {
	masterWidth : 80,
	detailWidth : 20,
	btnClasses : ["top-disabled", "left-disabled", "right", "width-20", "i5", "txt-right", "bg-color-disabled", "negative-fg-color", "border-disabled", "icon-unfilled-remove"]
},
    detailBtnClasses = ["top-disabled", "left-disabled", "right", "width-25", "i4", "txt-right", "bg-color-disabled", "active-fg-color", "border-disabled", "icon-edit"],
    isWindowOpen,
    logger = require("logger");

function init() {
	$.tableView.bottom = $.tableView.bottom + $.refillBtn.height + $.refillBtn.bottom;
	//prescriptions section
	var iconDict;
	/*
	 * only allow add prescriptions
	 * if canAdd flag is not false
	 */
	if (args.canAdd !== false) {
		iconDict = $.createStyle({
			classes : ["right", "i5", "bg-color-disabled", "active-fg-color", "border-disabled", "icon-add"],
			callback : didClickAdd
		});
	}
	$.prescSection = $.uihelper.createTableViewSection($, $.strings.orderDetSectionPresc, null, false, iconDict);
	//if more than one prescription is there add right icon to remove a prescription
	var isRemovable = prescriptions.length > 1;
	_.each(prescriptions, function(prescription) {
		_.extend(prescription, isRemovable ? removableDict : nonRemovableDict);
		var row = getRow(prescription);
		$.prescSection.add(row.getView());
		rows.push(row);
	});
	
}

function didClickAdd(e) {
	$.app.navigator.open({
		titleid : "titlePrescriptionsAdd",
		ctrl : "prescriptions",
		ctrlArguments : {
			filters : {
				id : _.pluck(prescriptions, "id"),
				refill_status : [apiCodes.refill_status_in_process, apiCodes.refill_status_ready]
			},
			prescriptions : selectedPrescriptions,
			patientSwitcherDisabled : true,
			useCache : true,
			selectable : true
		},
		stack : true
	});
}

function getRow(prescription) {
	var row = Alloy.createController("itemTemplates/masterDetailBtn", prescription);
	row.on("clickdetail", didClickRemove);
	return row;
}

function didClickRemove(e) {
	var params = e.data;
	rows = _.reject(rows, function(row) {
		return row.getParams().id === params.id;
	});
	prescriptions = _.reject(prescriptions, function(prescription) {
		return prescription.id === params.id;
	});
	$.tableView.deleteRow(e.source.getView());
	/**
	 *  make existing first row not removable
	 * if rows.length === 1
	 */
	if (prescriptions.length === 1) {
		var currentCtrl = rows[0],
		    currentRow = currentCtrl.getView(),
		    currentParams = currentCtrl.getParams();
		_.extend(currentParams, nonRemovableDict);
		rows[0] = getRow(currentParams);
		$.tableView.updateRow( OS_IOS ? 0 : currentRow, rows[0].getView());
	}
}

function didClickPickupModeClose(e) {
	$.pickupModePicker.hide();
}

function focus(e) {
	/**
	 * focus will be called whenever window gets focus / brought to front (closing a window)
	 * identify the first focus with a flag isWindowOpen
	 * Note: Moving this api call to init can show dialog on previous window on android
	 * as activities are created once window is opened
	 */
	if (!isWindowOpen) {
		isWindowOpen = true;
		getPrescriptionOrStore();
	} else if (store.shouldUpdate) {
		/**
		 * new store has been picked up
		 * reset the update flag
		 */
		store.shouldUpdate = false;
		// updatePickupOptionRow();
		updateDisplay();
	} else if (selectedPrescriptions.length) {
		/**
		 * make existing first row removable
		 * if rows.length is already > 1 then it would already be removable
		 */
		if (rows.length == 1) {
			var currentCtrl = rows[0],
			    currentRow = currentCtrl.getView(),
			    currentParams = currentCtrl.getParams();
			_.extend(currentParams, removableDict);
			rows[0] = getRow(currentParams);
			$.tableView.updateRow( OS_IOS ? 0 : currentRow, rows[0].getView());
		}
		_.each(selectedPrescriptions, function(prescription) {
			prescriptions.push(prescription);
			_.extend(prescription, removableDict);
			var row = getRow(prescription);
			$.tableView.insertRowAfter($.prescSection.rowCount - 1, row.getView());
			rows.push(row);
		});
		selectedPrescriptions = [];
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

function getPrescriptionOrStore() {
	/**
	 * update screen for pickup modes
	 * and store
	 */
	if (_.isEmpty(store)) {
		/**
		 * check for original store id of the first
		 * prescription sent to this screen
		 * Note: this screen doesn't have a scenario
		 * of being opened with zero prescriptions
		 */
		var prescription = prescriptions[0] || {};
		if (prescription.original_store_id) {
			/**
			 * if original store id is available
			 */
			getStore(prescription.original_store_id);
		} else {
			/**
			 * if original store id is not available
			 * call prescription get first
			 */
			$.http.request({
				method : "prescriptions_get",
				params : {
					data : [{
						prescriptions : {
							id : prescription.id,
							sort_order_preferences : Alloy.Models.sortOrderPreferences.get("selected_code_value"),
							prescription_display_status : apiCodes.prescription_display_status_active
						}
					}]
				},
				keepLoader : true,
				success : didGetPrescription,
				failure : didFail
			});
		}
	} else {
		getOrSetPickupModes();
	}
}

function didGetPrescription(result, passthrough) {
	var prescription = prescriptions[0];
	_.extend(prescription, result.data.prescriptions);
	getStore(prescription.original_store_id);
}

function getStore(storeId) {
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
}

function didGetStore(result, passthrough) {
	store = result.data.stores;
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
	logger.debug("\n\n\n Alloy.CFG.latest_pickup_mode = ", Alloy.CFG.latest_pickup_mode, "\n\n\n");
	var codes = Alloy.Models.pickupModes.get("code_values"),
	    defaultVal = $.utilities.getProperty(Alloy.CFG.latest_pickup_mode, Alloy.Models.pickupModes.get("default_value")),
	    selectedCode;
	    
	logger.debug("\n\n\n Alloy.CFG.latest_pickup_mode from api= ", Alloy.CFG.latest_pickup_mode, "\n\n\n");

	/**
	 * if defaultVal in store pickup
	 * then make sure the given store supports
	 * the same
	 */
	// if (defaultVal == apiCodes.pickup_mode_instore  && store.id == Alloy.Models.appload.get("mail_order_store_id") && !Alloy.CFG.mail_order_store_pickup_enabled) {
		// defaultVal = apiCodes.pickup_mode_mail_order;
		// logger.debug("\n\n\n default mode : ", defaultVal,"\t\t",Alloy.CFG.mail_order_store_pickup_enabled);
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
	//pickup details section
	$.pickupSection = $.uihelper.createTableViewSection($, $.strings.orderDetSectionPickup);
	/**
	 * if there are more then one option populate picker
	 * otherwise just show the default option
	 * if only one pickup option then
	 * don't show option to change
	 */
	if (codes.length > 1) {
		$.pickupModePicker.setItems(codes);
		$.pickupModeRow = Alloy.createController("itemTemplates/label", {
			title : selectedCode.code_display,
			hasChild : true
		});
		$.pickupSection.add($.pickupModeRow.getView());
	}
	//selected options value
	$.pickupOptionRow = Alloy.createController("itemTemplates/label", {
		title : $.strings.strLoading
	});
	$.pickupSection.add($.pickupOptionRow.getView());
	//set data
	$.tableView.setData([$.prescSection, $.pickupSection]);
	//update options row
	// updatePickupOptionRow();
	updateDisplay();
}

function updatePickupModeRow(e) {
	Alloy.Models.pickupModes.set("selected_code_value", e.data.code_value);
	var row = OS_IOS ? $.prescSection.rowCount : $.pickupModeRow.getView();
	//nullify last instance
	$.pickupModeRow = null;
	//point to new instance
	$.pickupModeRow = Alloy.createController("itemTemplates/label", {
		title : e.data.code_display,
		hasChild : true
	});
	$.tableView.updateRow(row, $.pickupModeRow.getView());
	updatePickupOptionRow();
}

function updatePickupOptionRow() {
	// var row = OS_IOS ? ($.prescSection.rowCount + $.pickupSection.rowCount) - 1 : $.pickupOptionRow.getView();
	// logger.debug("\n\n\n $.pickupOptionRow.getView --> in updatePickupOptionRow\n\n\n");
	// //nullify last instance
	// $.pickupOptionRow = null;
	switch(Alloy.Models.pickupModes.get("selected_code_value")) {
	case apiCodes.pickup_mode_instore:
		/**
		 * check whether the store supports
		 * instore pickup
		 */
		// if(Alloy.Globals.isMailOrderService)
		// {
			// store = {};
			// // should get home pharmacy for the selected  prescription
		// }
		
		Alloy.Globals.isMailOrderService = false;
		store = {};
		
		getPrescriptionOrStore();
		
		// var ishomepharmacy = parseInt(store.ishomepharmacy) || 0;
		// if(ishomepharmacy == 0){}
// 		
		// //point to new instance
		// updateDisplay();
		break;
	case apiCodes.pickup_mode_mail_order:
		//point to new instance
		// $.pickupOptionRow = Alloy.createController("itemTemplates/label", {
			// title : $.strings.orderDetLblMailOrder
		// });
		
		
		
		
					
		logger.debug("\n\n ");
		store = {};
		Alloy.Globals.isMailOrderService = true;

		if (Alloy.Globals.isLoggedIn && Alloy.Globals.isMailOrderService) {
			mailOrderCall();

		}
		
		break;
	}
	// $.tableView.updateRow(row, $.pickupOptionRow.getView());
}



function updateDisplay() {
	var row = OS_IOS ? ($.prescSection.rowCount + $.pickupSection.rowCount) - 1 : $.pickupOptionRow.getView();
	//nullify last instance
	$.pickupOptionRow = null;
	switch(Alloy.Models.pickupModes.get("selected_code_value")) {
	case apiCodes.pickup_mode_instore:
		/**
		 * check whether the store supports
		 * instore pickup
		 */
	
		//point to new instance
		$.pickupOptionRow = Alloy.createController("itemTemplates/masterDetailBtn", {
			masterWidth : 75,
			detailWidth : 25,
			title : store.title || $.strings.orderDetLblStoreTitle,
			subtitle : store.subtitle || $.strings.orderDetLblStoreSubtitle,
			btnClasses : detailBtnClasses
		});
		$.pickupOptionRow.on("clickdetail", didClickStoreChange);
		break;
	case apiCodes.pickup_mode_mail_order:
		//point to new instance
		
				
		$.pickupOptionRow = Alloy.createController("itemTemplates/masterDetailBtn", {
			masterWidth : 75,
			detailWidth : 25,
			title : store.title || $.strings.orderDetLblStoreTitle,
			subtitle : store.subtitle || $.strings.orderDetLblStoreSubtitle,
			btnClasses : detailBtnClasses
		});
		$.pickupOptionRow.on("clickdetail", didClickStoreChange);
		
		break;
	}
	$.tableView.updateRow(row, $.pickupOptionRow.getView());
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
				passthrough :  true ,
				errorDialogEnabled :  true ,
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
		logger.debug("\n\n\norder details - didgetstores -- results list empty\n\n\n");
		
		//this resets the list populated already
		result.data = {
			stores : {
				stores_list : []
			}
		};
	}

	var isLastFilled = parseInt(result.data.isLastFilled) || 0;
	logger.debug("\n\n\norder details - lastfilled ", isLastFilled);
	if(isLastFilled === 1)
	{
		_.extend(store, result.data.stores.stores_list[0]);
		_.extend(store, {
			title : $.utilities.ucword(store.addressline1),
			subtitle : $.utilities.ucword(store.city) + ", " + store.state + ", " + store.zip
		});
	
		logger.debug("\n\n\n order details - store last filled\n ",JSON.stringify(result.data.stores.stores_list[0], null, 4));
	}
	
	updateDisplay();
}



function didClickTableView(e) {
	/**
	 * validate row by it's className
	 */
	if ($.pickupModeRow && e.row.className == "labelWithChild") {
		$.pickupModePicker.show();
	}
}

function didClickStoreChange(e) {
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

function didClickRefill(e) {
	/**
	 * if pickup mode is pickup_mode_mail_order
	 *  then set the store id to mail_order_store_id from appload
	 *  this is specific to client
	 */
	var pickupMode = Alloy.Models.pickupModes.get("selected_code_value"),
	    // storeId = pickupMode == apiCodes.pickup_mode_mail_order ? Alloy.Models.appload.get("mail_order_store_id") : store.id,
	    
	    storeId = store.id,

	    data = [];
	//check if valid store id
	if (!storeId) {
		$.uihelper.showDialog({
			message : $.strings.orderDetValStore
		});
		return false;
	}
	//process request
	_.each(prescriptions, function(prescription) {
		data.push({
			id : prescription.id,
			rx_number : prescription.rx_number,
			store_id : storeId,
			pickup_mode : pickupMode,
			pickup_time_group : apiCodes.pickup_time_group_asap
		});
	});
	$.http.request({
		method : "prescriptions_refill",
		params : {
			filter : {
				refill_type : apiCodes.refill_type_text
			},
			data : [{
				prescriptions : data
			}]
		},
		success : didRefill
	});
}

function didRefill(result, passthrough) {
	var refilledPrescs = result.data.prescriptions;
	/**
	 * sending prescription name and rx number for success screen
	 * ensure the api returns the result in the same order
	 * of prescriptions client sent, otherwise this can break
	 */
	_.each(refilledPrescs, function(presc, index) {
		_.extend(presc, {
			title : prescriptions[index].title,
			subtitle : presc.refill_inline_message || presc.refill_error_message
		});
	});
	$.app.navigator.open({
		ctrl : "refillSuccess",
		ctrlArguments : {
			prescriptions : refilledPrescs,
			pickupMode : Alloy.Models.pickupModes.get("selected_code_value")
		}
	});
}

function hideAllPopups() {
	if ($.pickupModePicker && $.pickupModePicker.getVisible()) {
		return $.pickupModePicker.hide();
	}
	return false;
}

function terminate(e) {
	//destroy prescriptions array
	prescriptions = selectedPrescriptions = null;
}

exports.init = init;
exports.focus = focus;
exports.terminate = terminate;
exports.backButtonHandler = hideAllPopups;
