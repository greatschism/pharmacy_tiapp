var args = $.args,
    moment = require("alloy/moment"),
    prescription = args.prescription,
    rows = [],
    isWindowOpen,
    httpClient;

function init() {
	if (_.has(prescription, "history")) {
		setTimeout(didGetHistory, 1000);
	}
}

function focus() {
	if (!isWindowOpen) {
		isWindowOpen = true;
		if (!_.has(prescription, "history")) {
			isWindowOpen = true;
			httpClient = $.http.request({
				method : "prescriptions_get_refill_history",
				params : {
					data : [{
						prescriptions : [{
							id : prescription.id
						}]
					}]
				},
				showLoader : false,
				success : didGetHistory,
				failure : didFail
			});
		}
	}
}

function didFail(error, passthrough) {
	$.loader.hide();
	handleClose();
}

function didGetHistory(result, passthrough) {
	var data = [],
	    clientDateFormat = Alloy.CFG.date_format,
	    serverDateFormat = Alloy.CFG.apiCodes.date_format,
	    presNameSection = $.uihelper.createTableViewSection($, prescription.presc_name);
	httpClient = null;
	if (result && result.data) {
		/**
		 * load fresh data
		 */
		prescription.history = [];
		_.each(result.data.prescriptions, function(history) {

			if (Alloy.CFG.is_specialty_store_enabled && history.is_specialty_store == 1) {
				var subtitleClasses = ["active-fg-color", "left"];
				history = {
					id : history.store_id,
					title : $.utilities.ucword(history.store_name),
					subtitle : history.original_store_phone_number ? history.original_store_phone_number : $.utilities.ucword(history.addressline1) + ", " + $.utilities.ucword(history.city) + ", " + history.state + ", " + history.zip,
					subtitleClasses : history.original_store_phone_number ? subtitleClasses : "",
					detailTitle : history.copay != null ? "$" + parseFloat(history.copay) : "",
					detailType : "positive",
					detailSubtitle : history.quantity != null ? (history.quantityUnit ? history.quantity + " " + history.quantityUnit : history.quantity) : "",
					tertiaryTitle : history.filled_date && moment(history.filled_date, serverDateFormat).format(clientDateFormat) || ""
				};
			} else {
				history = {
					id : history.store_id,
					title : $.utilities.ucword(history.addressline1),
					subtitle : $.utilities.ucword(history.city) + ", " + history.state + ", " + history.zip,
					detailTitle : history.copay != null ? "$" + parseFloat(history.copay) : "",
					detailType : "positive",
					detailSubtitle : history.quantity != null ? (history.quantityUnit ? history.quantity + " " + history.quantityUnit : history.quantity) : "",
					tertiaryTitle : history.filled_date && moment(history.filled_date, serverDateFormat).format(clientDateFormat) || ""
				};
			}
			prescription.history.push(history);
			var row = Alloy.createController("itemTemplates/masterDetail", history);
			presNameSection.add(row.getView());
			rows.push(row);
			row.on("clickPhone", didClickPhone);
		});
	} else {
		/**
		 * load from cache
		 */
		_.each(prescription.history, function(history) {
			var row = Alloy.createController("itemTemplates/masterDetail", history);
			presNameSection.add(row.getView());
			rows.push(row);
		});
	}
	data.push(presNameSection);
	$.tableView.setData(data);	//	$.tableView.appendSection(presNameSection);	// alternate way is to use appendSection 
	$.loader.hide();
}

function didClickTableView(e) {
	var row = rows[e.index];
	if (row) {
		$.app.navigator.open({
			titleid : "titleStoreDetails",
			ctrl : "storeDetails",
			ctrlArguments : {
				store : row.getParams()
			},
			stack : true
		});
	}
}

function terminate() {
	if (httpClient) {
		httpClient.abort();
	}
}

function handleClose() {
	$.app.navigator.close();
}

function didClickPhone(e) {
	if ($.utilities.validatePhoneNumber(e.data.subtitle)) {
		if (!Titanium.Contacts.hasContactsPermissions()) {
			Titanium.Contacts.requestContactsPermissions(function(result) {
				if (result.success) {
					$.uihelper.getPhone({
						firstName : e.data.title,
						phone : {
							work : [e.data.subtitle]
						}
					}, e.data.subtitle);
				} else {
					$.analyticsHandler.trackEvent("Specialty-ContactDetails", "click", "DeniedContactsPermission");
				}
			});
		} else {
			$.uihelper.getPhone({
				firstName : e.data.title,
				phone : {
					work : [e.data.subtitle]
				}
			}, e.data.subtitle);
		}
	}
}

exports.init = init;
exports.focus = focus;
exports.terminate = terminate;
