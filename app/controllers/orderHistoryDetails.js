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
    orderDetailsData = args.orderDetailsData,
    postlayoutCount = 0,
    rows = [];

var data = [],
    orderDetails,
    shipmentDetails,
    paymentDetails,
    orderSummary;

var sections = {
	orderDetails : [],
	shipmentDetails : [],
	paymentDetails : [],
	orderSummary : []
};

var sectionHeaders = {
	orderDetails : "",
	shipmentDetails : "Shipment details",
	paymentDetails : "Payment information",
	orderSummary : "Order Summary"
};

function init() {
	analyticsCategory = require("moduleNames")[$.ctrlShortCode] + "-" + require("ctrlNames")[$.ctrlShortCode];
}

function focus() {
	if (!isWindowOpen) {
		isWindowOpen = true;
		logger.debug("\n\n\n args.orderDetailsData		", JSON.stringify(orderDetailsData, null, 4), "\n\n\n");

		var totalPrice = orderDetailsData.totalRxPrice != null ? (orderDetailsData.deliveryCost != null ? parseFloat(orderDetailsData.totalRxPrice) + parseFloat(orderDetailsData.deliveryCost) : parseFloat(orderDetailsData.totalRxPrice) ) : 0;

		if (orderDetailsData) {
			var history = {
				section : "orderDetails",
				itemTemplate : "masterDetail",
				masterWidth : 40,
				detailWidth : 60,
				id : orderDetailsData.orderNumber || null,
				title : "Order date",
				detailTitle : moment(orderDetailsData.orderDate, apiCodes.date_format).format(Alloy.CFG.date_format),
				subtitle : "Order #",
				detailSubtitle : orderDetailsData.orderNumber || null,
				tertiaryTitle : "Order total",
				detailTertiaryTitle : totalPrice == 0 ? "$0.00" : "$" + totalPrice.toFixed(2),
				detailTertiaryType : "positive",
				titleClasses : titleClasses,
				subtitleClasses : titleClasses,
				ttClasses : titleClasses,
				detailClasses : detailClasses
			};

			orderDetails = $.uihelper.createTableViewSection($, "", sectionHeaders["orderDetails"], false);

			var rowParams = history,
			    row;

			rowParams.filterText = _.values(_.pick(rowParams, ["title", "tertiaryTitle"])).join(" ").toLowerCase();
			row = Alloy.createController("itemTemplates/".concat(rowParams.itemTemplate), rowParams);

			sectionHeaders[rowParams.section] += rowParams.filterText;
			sections[rowParams.section].push(row);
			orderDetails.add(row.getView());

			data.push(orderDetails);

			if (orderDetailsData.prescriptions.length) {

				var headerDict = $.createStyle({
					classes : ["bubble-disabled"],
					title : orderDetailsData.deliveryType,
					accessibilityLabel : orderDetailsData.deliveryType,
					secondaryHeader : true
				});

				shipmentDetails = $.uihelper.createTableViewSection($, "Shipment details", sectionHeaders["shipmentDetails"], false, headerDict);

				_.each(orderDetailsData.prescriptions, function(prescription) {

					prescription = {
						section : "shipmentDetails",
						itemTemplate : "masterDetail",
						id : prescription.rxNumber,
						title : $.utilities.ucword(prescription.rxName),
						subtitle : "#" + prescription.rxNumber,
						detailTitle : prescription.copay == 0 ? "$0.00" : "$" + parseFloat(prescription.copay).toFixed(2),
						detailType : "positive",
						titleClasses : titleClasses
					};

					_.extend(prescription, {
						titleClasses : ["left", "h5", "fg-color"]
					});

					var rowParams1 = prescription,
					    row1;

					rowParams1.filterText = _.values(_.pick(rowParams1, ["title", "tertiaryTitle"])).join(" ").toLowerCase();
					row1 = Alloy.createController("itemTemplates/".concat(rowParams1.itemTemplate), rowParams1);

					sectionHeaders[rowParams1.section] += rowParams1.filterText;
					sections[rowParams1.section].push(row1);
					shipmentDetails.add(row1.getView());

				});

				data.push(shipmentDetails);

			}

			paymentDetails = $.uihelper.createTableViewSection($, "Payment information", sectionHeaders["paymentDetails"], false);

			var payment = {
				section : "paymentDetails",
				itemTemplate : "masterDetail",
				masterWidth : 100,
				detailWidth : 0,
				title : "Payment Method",
				subtitle : orderDetailsData.cardType + " " + Alloy.Globals.strings.checkoutCCEndingIn + " " + orderDetailsData.lastFourDigit,
				titleClasses : titleClasses
			};

			_.extend(payment, {
				titleClasses : ["left", "h5", "fg-color"]
			});

			var rowParams2 = payment,
			    row2;

			rowParams2.filterText = _.values(_.pick(rowParams2, ["title"])).join(" ").toLowerCase();
			row2 = Alloy.createController("itemTemplates/".concat(rowParams2.itemTemplate), rowParams2);

			sectionHeaders[rowParams2.section] += rowParams2.filterText;
			sections[rowParams2.section].push(row2);
			paymentDetails.add(row2.getView());

			data.push(paymentDetails);

			orderSummary = $.uihelper.createTableViewSection($, "Order Summary", sectionHeaders["orderSummary"], false);

			var summary = {
				section : "orderSummary",
				itemTemplate : "masterDetail",
				masterWidth : 100,
				detailWidth : 0,
				title : "Items:",
				detailTitle : "$" +(orderDetailsData.totalRxPrice || "0.00"),
				subtitle : "Shipping & Handling:",
				detailSubtitle : "$" +(orderDetailsData.deliveryCost || "0.00"),
				tertiaryTitle : "Order total",
				detailTertiaryTitle : totalPrice == 0 ? "$0.00" : "$" + totalPrice.toFixed(2),
				detailTertiaryType : "positive",
				titleClasses : titleClasses,
				subtitleClasses : titleClasses,
				ttClasses : titleClasses,
				detailClasses : detailClasses
			};

			_.extend(summary, {
				ttClasses : ["left", "h3", "fg-color", "wrap-disabled"],
				detailClasses : ["margin-left-small", "h5", "right", "txt-right", "wrap-disabled"]
			});

			var rowParams3 = summary,
			    row3;

			rowParams3.filterText = _.values(_.pick(rowParams3, ["title"])).join(" ").toLowerCase();
			row3 = Alloy.createController("itemTemplates/".concat(rowParams3.itemTemplate), rowParams3);

			sectionHeaders[rowParams3.section] += rowParams3.filterText;
			sections[rowParams3.section].push(row3);
			orderSummary.add(row3.getView());

			data.push(orderSummary);

			$.tableView.setData(data);

		}

	}
}

exports.init = init;
exports.focus = focus;
