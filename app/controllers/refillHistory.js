var args = arguments[0] || {},
    moment = require("alloy/moment"),
    prescription = args.prescription,
    rows = [],
    httpClient;

function init() {
	if (!_.has(prescription, "history")) {
		httpClient = $.http.request({
			method : "prescriptions_getrefillhistory",
			params : {
				feature_code : "THXXX",
				data : [{
					prescriptions : [{
						id : prescription.id
					}]
				}]
			},
			showLoader : false,
			success : didGetHistory
		});
	} else {
		setTimeout(didGetHistory, 1000);
	}
}

function didGetHistory(result, passthrough) {
	var data = [],
	    clientDateFormat = Alloy.CFG.date_format,
	    serverDateFormat = Alloy.CFG.apiCodes.date_format;
	httpClient = null;
	if (result && result.data) {
		/**
		 * load fresh data
		 */
		prescription.history = [];
		_.each(result.data.prescriptions, function(history) {
			history = {
				id : history.store_id,
				title : $.utilities.ucword(history.addressline1),
				subtitle : $.utilities.ucword(history.city) + ", " + history.state + ", " + history.zip,
				detailSubtitle : history.sold_date && moment(history.sold_date, serverDateFormat).format(clientDateFormat) || ""
			};
			prescription.history.push(history);
			var row = Alloy.createController("itemTemplates/masterDetail", history);
			data.push(row.getView());
			rows.push(row);
		});
	} else {
		/**
		 * load from cache
		 */
		_.each(prescription.history, function(history) {
			var row = Alloy.createController("itemTemplates/masterDetail", history);
			data.push(row.getView());
			rows.push(row);
		});
	}
	$.tableView.setData(data);
	$.loader.hide();
}

function didClickTableView(e) {
	var row = rows[e.index];
	if (row) {
		$.uihelper.getLocation(function didGetLocation(currentLocation) {
			$.app.navigator.open({
				titleid : "titleStoreDetails",
				ctrl : "storeDetails",
				ctrlArguments : {
					store : row.getParams(),
					currentLocation : currentLocation,
					direction : !_.isEmpty(currentLocation)
				},
				stack : true
			});
		});
	}
}

function terminate() {
	if (httpClient) {
		httpClient.abort();
	}
}

exports.init = init;
exports.terminate = terminate;
