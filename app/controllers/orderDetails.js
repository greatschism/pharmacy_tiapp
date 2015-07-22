/**
 * clone store object
 * updating this store object later
 * should not affect the previous screen
 */
var args = arguments[0] || {},
    apiCodes = Alloy.CFG.apiCodes,
    rows = [],
    store = _.clone(args.store || {}),
    prescriptions = args.prescriptions || [],
    selectedPrescriptions = [],
    nonRemovableDict = {
	masterWidth : 100,
	detailWidth : 0,
	btnClasses : false
},
    removableDict = {
	masterWidth : 70,
	detailWidth : 30,
	btnClasses : ["content-detail-negative-icon", "icon-unfilled-remove"]
},
    detailBtnClasses = ["content-detail-tertiary-icon", "icon-edit"],
    isWindowOpen;

function init() {
	$.tableView.bottom = $.tableView.bottom + $.orderBtn.height + $.orderBtn.bottom;
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
	//prescriptions section
	var iconDict;
	/*
	 * only allow add prescriptions
	 * if canAdd flag is not false
	 */
	if (args.canAdd !== false) {
		iconDict = $.createStyle({
			classes : ["content-header-right-icon", "icon-add"]
		});
		_.extend(iconDict, {
			isIcon : true,
			callback : didClickAdd
		});
	}
	$.prescSection = $.uihelper.createTableViewSection($, $.strings.orderDetSectionPresc, null, false, false, iconDict);
	//if more than one prescription is there add right icon to remove a prescription
	var isRemovable = prescriptions.length > 1;
	_.each(prescriptions, function(prescription) {
		_.extend(prescription, isRemovable ? removableDict : nonRemovableDict);
		var row = getRow(prescription);
		$.prescSection.add(row.getView());
		rows.push(row);
	});
	//pickup details
	$.pickupSection = $.uihelper.createTableViewSection($, $.strings.orderDetSectionPickup);
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
		$.pickupModeRow = Alloy.createController("itemTemplates/labelWithChild", {
			title : title
		});
		$.pickupSection.add($.pickupModeRow.getView());
	}
	//selected options value
	$.pickupOptionRow = Alloy.createController("itemTemplates/label", {
		title : $.strings.strLoading
	});
	$.pickupSection.add($.pickupOptionRow.getView());
	$.tableView.setData([$.prescSection, $.pickupSection]);
}

function didClickAdd(e) {
	$.app.navigator.open({
		titleid : "titleAddPrescriptions",
		ctrl : "prescriptions",
		ctrlArguments : {
			filters : {
				id : _.pluck(prescriptions, "id"),
				refill_status : [apiCodes.refill_status_in_process, apiCodes.refill_status_ready]
			},
			prescriptions : selectedPrescriptions,
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
		var codes = Alloy.Models.pickupModes.get("code_values");
		if (codes) {
			/**
			 * codes are already available
			 * proceed further
			 *
			 * if only one pickup option then
			 * don't show option to change
			 */
			getPrescriptionOrStore();
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
		updatePickupOptionRow();
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
	$.app.navigator.close();
}

function getPickupModes() {
	/**
	 * if we don't have stoe information already
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

function didGetPickupModes(result) {
	/**
	 * args.pickupMode is prefered pickup mode
	 * for this transaction
	 * Ex: if we reach this screen from store details
	 * then prefered pickup mode will be pickup_mode_instore
	 * if default is mail order then we have to
	 * give first pererence for args.pickupMode
	 */
	Alloy.Models.pickupModes.set(result.data.codes[0]);
	var codes = Alloy.Models.pickupModes.get("code_values"),
	    defaultVal = args.pickupMode || Alloy.Models.pickupModes.get("default_value"),
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
		updatePickupModeRow({
			data : selectedCode
		}, true);
	} else {
		$.tableView.deleteRow($.pickupModeRow.getView());
		$.pickupModeRow = null;
	}
	getPrescriptionOrStore();
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
					feature_code : "THXXX",
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

		/**
		 * store information and pickup modes are already available
		 * update pickup option row
		 */
		updatePickupOptionRow();
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
			feature_code : "THXXX",
			data : [{
				stores : {
					id : storeId,
				}
			}]
		},
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
	updatePickupOptionRow();
}

function updatePickupModeRow(e, ignoreOptionUpdate) {
	Alloy.Models.pickupModes.set("selected_code_value", e.data.code_value);
	var row = OS_IOS ? $.prescSection.rowCount : $.pickupModeRow.getView();
	//nullify last instance
	$.pickupModeRow = null;
	//point to new instance
	$.pickupModeRow = Alloy.createController("itemTemplates/labelWithChild", {
		title : e.data.code_display
	});
	$.tableView.updateRow(row, $.pickupModeRow.getView());
	/**
	 * update the option
	 * if it is called from widget
	 * at selection event
	 * otherwise leave it, will be again
	 * called form getPrescriptionOrStore
	 */
	if (ignoreOptionUpdate !== true) {
		updatePickupOptionRow();
	}
}

function updatePickupOptionRow() {
	var row = OS_IOS ? ($.prescSection.rowCount + $.pickupSection.rowCount) - 1 : $.pickupOptionRow.getView();
	//nullify last instance
	$.pickupOptionRow = null;
	switch(Alloy.Models.pickupModes.get("selected_code_value")) {
	case apiCodes.pickup_mode_instore:
		//point to new instance
		$.pickupOptionRow = Alloy.createController("itemTemplates/masterDetailBtn", {
			masterWidth : 70,
			detailWidth : 30,
			title : store.title,
			subtitle : store.subtitle,
			btnClasses : detailBtnClasses
		});
		$.pickupOptionRow.on("clickdetail", didClickStoreChange);
		break;
	case apiCodes.pickup_mode_mail_order:
		//point to new instance
		$.pickupOptionRow = Alloy.createController("itemTemplates/label", {
			title : $.strings.orderDetLblMailOrderAddress
		});
		break;
	}
	$.tableView.updateRow(row, $.pickupOptionRow.getView());
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
			selectable : true
		},
		stack : true
	});
}

function didClickOrder(e) {
	/**
	 * if pickup mode is pickup_mode_mail_order
	 *  then set the store id to mail_order_store_id from appload
	 *  this is specific to client
	 */
	var pickupMode = Alloy.Models.pickupModes.get("selected_code_value"),
	    storeId = pickupMode == apiCodes.pickup_mode_instore ? store.id : Alloy.Models.appload.get("mail_order_store_id"),
	    data = [];
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
			feature_code : "THXXX",
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
	var refilledPrescs = result.data.prescriptions,
	    isPartial = false;
	/**
	 * ensure the api returns the result in the same order
	 * of prescriptions client sent, otherwise this can break
	 */
	_.each(refilledPrescs, function(presc, index) {
		if (!isPartial && presc.refill_is_error === "true") {
			isPartial = true;
		}
		_.extend(presc, prescriptions[index]);
	});
	$.app.navigator.open({
		titleid : "titleRefillSuccess",
		ctrl : "refillSuccess",
		ctrlArguments : {
			prescriptions : refilledPrescs,
			isPartial : isPartial,
			store : _.clone(store)
		}
	});
}

function terminate(e) {
	//destroy prescriptions array
	prescriptions = selectedPrescriptions = null;
}

exports.init = init;
exports.focus = focus;
exports.terminate = terminate;
