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
				detailSubtitle : history.filled_date && moment(history.filled_date, serverDateFormat).format(clientDateFormat) || "",
				detailTitle : history.copay != null ? "$"+parseFloat(history.copay) : ""
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

exports.init = init;
exports.focus = focus;
exports.terminate = terminate;
