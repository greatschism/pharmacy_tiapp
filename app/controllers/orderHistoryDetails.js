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
    orderDetailsData = args.orderDetailsData,
    postlayoutCount = 0,
    rows = [];

function init() {
	analyticsCategory = require("moduleNames")[$.ctrlShortCode] + "-" + require("ctrlNames")[$.ctrlShortCode];
}

function focus() {
	if (!isWindowOpen) {
		isWindowOpen = true;
		logger.debug("\n\n\n args.orderDetailsData		", JSON.stringify(orderDetailsData, null, 4), "\n\n\n");

		if (orderDetailsData) {
			$.orderNumberLbl.text = "#" + orderDetailsData.orderNumber || null;
			$.orderDateLbl.text = moment(orderDetailsData.orderDate, apiCodes.date_format).format(Alloy.CFG.date_format);

			$.orderDeliveryTypeReplyLbl.text = orderDetailsData.deliveryType;
			$.orderDeliveryCostReplyLbl.text = "$" + orderDetailsData.deliveryCost;
			$.orderDeliveryAddressReplyLbl.text = orderDetailsData.deliveryAddress;
			$.orderContactNumerReplyLbl.text = $.utilities.isPhoneNumber(orderDetailsData.mobileNumber) ? $.utilities.formatPhoneNumber(orderDetailsData.mobileNumber) : "";
			$.orderPaymentMethodReplyLbl.text = orderDetailsData.cardType + " ending in " + orderDetailsData.lastFourDigit;

			var totalPrice = orderDetailsData.totalRxPrice != null ? (orderDetailsData.deliveryCost != null ? parseFloat(orderDetailsData.totalRxPrice) + parseFloat(orderDetailsData.deliveryCost) : parseFloat(orderDetailsData.totalRxPrice) ) : 0;

			$.orderTotalCostReplyLbl.text = totalPrice == 0 ? "$0" : "$" + totalPrice.toFixed(2);
			$.prescAsyncView.hide();

			var data = [];

			if (orderDetailsData.prescriptions.length) {
				_.each(orderDetailsData.prescriptions, function(prescription) {

					prescription = {
						id : prescription.rxNumber,
						title : $.utilities.ucword(prescription.rxName),
						subtitle : "#" + prescription.rxNumber,
						detailTitle : prescription.copay == 0 ? "$0" : "$" + parseFloat(prescription.copay).toFixed(2),
						detailType : "positive"
						// tertiaryTitle :
					};
					var row = Alloy.createController("itemTemplates/masterDetail", prescription);
					data.push(row.getView());
					rows.push(row);
				});

				$.tableView.setData(data);
			}
			setTimeout(didUpdateUI, 1000);
		}

	}
}

function didUpdateUI() {
	/**
	 * PHA-1086 - keep it expanded
	 * incase to revert:
	 * 1. Update the toggle
	 * (show more / less) title in xml
	 * 2. remove $.prescExp.expand();
	 * 3. keep only $.loader.hide();
	 * 4. move this setTimeout(didUpdateUI, 1000);
	 * to init
	 */
	$.prescExp.expand();
	if (Ti.App.accessibilityEnabled) {
		togglePrescription();
	};
	$.loader.hide();
}

function togglePrescription(e) {
	var title,
	    result;
	if ($.prescExp.isExpanded()) {
		title = "prescDetExpand";
		result = $.prescExp.collapse();
	} else {
		title = "prescDetCollapse";
		result = $.prescExp.expand();
	}
	if (result) {
		// $.toggleLbl.text = $.strings[title];
	}
	// $.loader.hide();

}

function didClickShowPrescriptions() {
	$.rxContainerView.show();
}

function didClickHide(e) {
	$.rxContainerView.hide();
}

function didPostlayoutPrompt(e) {
	logger.debug("\n\n\n in didPostlayoutPrompt\n\n\n");

	var source = e.source,
	    children = source.getParent().children;
	// source.removeEventListener("postlayout", didPostlayoutPrompt);
	children[1].applyProperties({
		left : children[1].left + children[0].rect.width,
		visible : true
	});
	postlayoutCount++;
	if (postlayoutCount === 0) {
		$.prescExp.setStopListening(true);
		// $.loader.hide();
		logger.debug("\n\n\n stop listening\n\n\n");
	}
}

function didPostlayout(e) {
	/*
	$.rxContainerView.removeEventListener("postlayout", didPostlayout);
		var top = $.tableView.top,
			margin = $.tableView.bottom,
			bottom;
		bottom = margin;
		bottom = bottom + $.hideBtn.height * 2;
	
		$.tableView.applyProperties({
			top : top,
			bottom : bottom
		});
		
		$.hideBtn.applyProperties({
			top : bottom
		});*/
	
}

exports.init = init;
exports.focus = focus;
