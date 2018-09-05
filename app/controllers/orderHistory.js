var args = $.args,
    moment = require("alloy/moment"),
    logger = require("logger"),
    authenticator = require("authenticator"),
    rx = require("rx"),
    apiCodes = Alloy.CFG.apiCodes,
    validator = args.validator,
    titleClasses = ["left", "h5", "inactive-fg-color", "wrap-disabled"],
    subtitleClasses = ["margin-top-small", "h5", "left", "inactive-fg-color", "wrap-disabled"],
    detailClasses = ["margin-left-small", "h5", "right", "txt-left", "wrap-disabled"],
    isWindowOpen,
    orderDetailsData = [],
    rows = [];

function init() {
	analyticsCategory = require("moduleNames")[$.ctrlShortCode] + "-" + require("ctrlNames")[$.ctrlShortCode];

	/**
	 * by default point to a
	 * non partial account
	 * only if patientSwitcherDisabled is false
	 */
	$.patientSwitcher.set({
		// revert : true,
		title : $.strings.orderHistoryPatientSwitcher,
		where : {
			is_partial : false
		}
	});
}

function focus() {
	if (!isWindowOpen) {
		isWindowOpen = true;

		getOrderHistory();

		if ($.patientSwitcher.visible) {
			logger.debug("\n\n\n patientSwitcher is visible \n\n\n");
		}
	}
}

function getOrderHistory() {
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

function didGetOrderHistory(result, passthrough) {
	$.app.navigator.hideLoader();

	var data = [],
	    clientDateFormat = Alloy.CFG.date_format,
	    serverDateFormat = Alloy.CFG.apiCodes.date_format;
	if (result && result.data && (result.data.OrderDetailsHistory != null)) {
		orderDetailsData = result.data.OrderDetailsHistory;
		_.each(result.data.OrderDetailsHistory, function(history) {
			var totalPrice = history.totalRxPrice != null ? (history.deliveryCost != null ? parseFloat(history.totalRxPrice) + parseFloat(history.deliveryCost) : parseFloat(history.totalRxPrice) ) : 0;

			history = {
				masterWidth : 40,
				detailWidth : 60,
				id : history.orderNumber,
				title : "Order date",
				detailTitle : moment(history.orderDate, apiCodes.date_format).format(Alloy.CFG.date_format),
				subtitle : "Order #",
				detailSubtitle : history.orderNumber,
				tertiaryTitle : "Order total",
				detailTertiaryTitle : totalPrice == 0 ? "$0.00" : "$" + totalPrice.toFixed(2),
				detailTertiaryType : "positive",
				titleClasses : titleClasses,
				subtitleClasses : titleClasses,
				ttClasses : titleClasses,
				detailClasses : detailClasses
			};

			var row = Alloy.createController("itemTemplates/masterDetail", history);
			data.push(row.getView());
			rows.push(row);
		});

		$.tableView.setData(data);
	} else {
		$.uihelper.showDialog({
			message : $.strings.orderHistoryMsgEmptyList,
			buttonNames : [Alloy.Globals.strings.dialogBtnOK]
		});
	}
}

function didFail(result, passthrough) {
	/**
	 * if something goes odd with api
	 * just close this screen to
	 * prevent any further actions
	 */
	$.app.navigator.hideLoader();
	handleClose();
}

function didClickTableView(e) {
	logger.debug("\n\n\n e 		", JSON.stringify(e, null, 4), "\n\n\n");
	$.app.navigator.open({
		titleid : "titleOrderHistory",
		ctrl : "orderHistoryDetails",
		ctrlArguments : {
			orderDetailsData : orderDetailsData[e.index]
		},
		stack : true
	});

}

function prepareData() {
	var currentPatient = $.patientSwitcher.get();
	/*
	 if (currentPatient.get("is_partial")) {
	 $.partialDescLbl.text = $.strings.prescPartialLblDesc;
	 if (!$.partialView.visible) {
	 $.partialView.visible = true;
	 }
	 } else {
	 //hide if any
	 if ($.partialView.visible) {
	 $.partialView.visible = false;
	 }
	 }
	 */

	getOrderHistory();

}

function handleClose() {
	$.app.navigator.open(Alloy.Collections.menuItems.findWhere({
		landing_page : true
	}).toJSON());
}

function didPostlayout(e) {
	$.headerView.removeEventListener("postlayout", didPostlayout);
	var top = $.headerView.rect.height,
	    margin = $.tableView.bottom,
	    bottom;
	bottom = margin;

	$.tableView.applyProperties({
		top : top,
		bottom : bottom
	});
	/*
	 $.partialView.applyProperties({
	 top : top,
	 bottom : bottom
	 });
	 */

}

function setParentView(view) {
	if ($.patientSwitcher) {
		$.patientSwitcher.setParentView(view);
	}
}

function terminate() {
	//terminate patient switcher
	if ($.patientSwitcher) {
		$.patientSwitcher.terminate();
	}
}

exports.init = init;
exports.focus = focus;
exports.terminate = terminate;
exports.setParentView = setParentView;
