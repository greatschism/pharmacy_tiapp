var args = $.args,
    moment = require("alloy/moment"),
    logger = require("logger"),
    authenticator = require("authenticator"),
    rx = require("rx"),
    apiCodes = Alloy.CFG.apiCodes,
    validator = args.validator,
    titleClasses = ["left", "h4", "wrap-disabled"],
    subtitleClasses = ["margin-top-small", "left", "inactive-fg-color", "wrap-disabled"],
    detailClasses = ["margin-left-small", "custom-fg-color"],
    isWindowOpen,
    orderDetailsData = [],
    rows = [];

function init() {
	analyticsCategory = require("moduleNames")[$.ctrlShortCode] + "-" + require("ctrlNames")[$.ctrlShortCode];
}

function focus() {
	if (!isWindowOpen) {
		isWindowOpen = true;

		$.http.request({
			method : "order_history_get",
			params : {
				data : []
			},
			keepLoader : true,
			errorDialogEnabled : true,
			success : didGetOrderHistory,
			failure : didFail
		});
	}
}

function didGetOrderHistory(result, passthrough) {
	$.app.navigator.hideLoader();

	var data = [],
	    clientDateFormat = Alloy.CFG.date_format,
	    serverDateFormat = Alloy.CFG.apiCodes.date_format;
	if (result && result.data && result.data.OrderDetailsHistory.length) {
		orderDetailsData = result.data.OrderDetailsHistory;
		_.each(result.data.OrderDetailsHistory, function(history) {
			var totalPrice = history.totalRxPrice != null ? ( history.deliveryCost != null ? parseFloat(history.totalRxPrice) + parseFloat(history.deliveryCost) : parseFloat(history.totalRxPrice) ) : 0;
			
			history = {
				id : history.orderNumber,
				title : "#"+ $.utilities.ucword(history.orderNumber),
				subtitle : history.orderDate, //moment(history.orderDate, apiCodes.date_format).format(Alloy.CFG.date_format), //history.orderDate && moment(history.orderDate, serverDateFormat).format(clientDateFormat) || ""
				detailTitle : totalPrice == 0 ? "$0" : "$"+totalPrice.toFixed(2),
				detailType : "positive"
				// tertiaryTitle : 
			};
			var row = Alloy.createController("itemTemplates/masterDetail", history);
			data.push(row.getView());
			rows.push(row);
		});

		$.tableView.setData(data);
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

function didClickTableView(e) {
	
	$.app.navigator.open({
		titleid : "titleOrderHistory",
		ctrl : "orderHistoryDetails",
		ctrlArguments : {
			orderDetailsData : orderDetailsData
		},
		stack : true
	});
	
}

exports.init = init;
exports.focus = focus;
