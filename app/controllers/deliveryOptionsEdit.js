var args = $.args,
    moment = require("alloy/moment"),
    logger = require("logger"),
    authenticator = require("authenticator"),
    isWindowOpen,
    httpClient,
    utilities = require("utilities"),
    apiCodes = Alloy.CFG.apiCodes,
    currentPatient,
    httpClient = require("http"),
    delAddress = args.delAddress;

var data = [],
    cardTypes,
    billingInfo;

var sections = {
	cardTypes : [],
	billingInfo : []
};

var sectionHeaders = {
	cardTypes : "",
	billingInfo : "Enter the card holder name and billing address"
};

function init() {
	analyticsCategory = require("moduleNames")[$.ctrlShortCode] + "-" + require("ctrlNames")[$.ctrlShortCode];
}

function focus() {
	currentPatient = Alloy.Collections.patients.findWhere({
		selected : true
	});
	/*
	 * avoid null pointer if another controller or another instance of this controller
	 * used this global variable in it's life span
	 */
	Alloy.Globals.currentTable = $.tableView;
	/**
	 * focus will be called whenever window gets focus / brought to front (closing a window)
	 * identify the first focus with a flag isWindowOpen
	 * Note: Moving this api call to init can show dialog on previous window on android
	 * as activities are created once window is opened
	 */
	if (!isWindowOpen) {
		isWindowOpen = true;
		showDeliveryOptions();
	}
}

function showDeliveryOptions() {
	logger.debug("\n\n\nIn args			", JSON.stringify(args, null, 4), "\n\n\n\n");

	cardTypes = $.uihelper.createTableViewSection($, "", sectionHeaders["cardTypes"], false);

	/*
	 _.each(args.DeliveryModeDetails, function(deliveryMode) {
	 deliveryOptions.push({
	 title : deliveryMode.deliveryOptions.concat("\t$", deliveryMode.deliveryAmount),
	 value : deliveryMode.deliveryAmount,
	 selected : deliveryMode.selected
	 });
	 });
	 * */

	logger.debug("\n\n\n Alloy.Collections.deliveryOptions edit		", JSON.stringify(Alloy.Collections.deliveryOptions, null, 4), "\n\n\n");

	Alloy.Collections.deliveryOptions.each(function(deliveryMode, index) {
		if (deliveryMode.get("enabled")) {
			var tClasses = ["left", "h5"],
			    sClasses = ["margin-top-small", "left", "h7", "inactive-fg-color"];
			var cardDetails = {
				section : "cardTypes",
				itemTemplate : "masterDetailWithLIcon",
				masterWidth : 60,
				detailWidth : 40,
				title : deliveryMode.get("deliveryOptions"),
				titleClasses : tClasses,
				detailTitle : deliveryMode.get("deliveryAmount") != null ? "$" + parseFloat(deliveryMode.get("deliveryAmount")).toFixed(2) : "$0.00",
				detailType : "positive",
				selected : deliveryMode.get("selected")
			};

			var rowParams = cardDetails,
			    row;

			rowParams.filterText = _.values(_.pick(rowParams, ["title", "detailTitle", "detailSubtitle"])).join(" ").toLowerCase();
			row = Alloy.createController("itemTemplates/".concat(rowParams.itemTemplate), rowParams);

			sectionHeaders[rowParams.section] += rowParams.filterText;
			sections[rowParams.section].push(row);
			cardTypes.add(row.getView());
		}
	});

	data.push(cardTypes);
	$.tableView.setData(data);

	showShippingDetails();
}

function showShippingDetails() {
	billingInfo = $.uihelper.createTableViewSection($, "Delivery Information", sectionHeaders["billingInfo"], false);

	var tClasses = ["h5"],
	    sClasses = ["margin-top-small", "left", "h7", "inactive-fg-color"];

	var billingDetails = {
		section : "billingInfo",
		itemTemplate : "cardHolderDetails",
		address : delAddress.address,
		city : delAddress.city,
		state : delAddress.state,
		zip : delAddress.zip,
		phone : (delAddress.phone != null ? delAddress.phone : (currentPatient.get("mobile_number") != null ? ($.utilities.isPhoneNumber(currentPatient.get("mobile_number")) ? $.utilities.formatPhoneNumber(currentPatient.get("mobile_number")) : "" ) : "" ))
		// instructions : "Delivery Instructions"
	};

	var rowParams = billingDetails,
	    row;

	row = Alloy.createController("itemTemplates/".concat(rowParams.itemTemplate), rowParams);

	sectionHeaders[rowParams.section] += rowParams.filterText;
	sections[rowParams.section].push(row);
	billingInfo.add(row.getView());

	data.push(billingInfo);
	$.tableView.setData(data);

	$.bottomView.show();
}

function didClickTableView(e) {

	var index = e.index;
	var count = 0;
	var rIndex;

	_.each(sections, function(rows, sid) {
		if (sid === "cardTypes") {
			rIndex = count - 1;
			_.each(rows, function(row, rid) {

				rIndex++;
				var params = row.getParams();
				if (index == rid) {
					params.selected = !params.selected;
				} else {
					params.selected = false;
				}
				rows[rid] = Alloy.createController("itemTemplates/masterDetailWithLIcon", params);
				$.tableView.updateRow( OS_IOS ? rIndex : row.getView(), rows[rid].getView());

			});
		}
		count += rows.length;
	});

}

function didClickSubmit(e) {
	var selectedDeliveryIndex = -1;
	var selectedDeliveryAddressIndex = -1;
	var selectedDeliveryAddr = false;
	var count = 0;
	var rIndex = count - 1;
	_.each(sections, function(rows, sid) {
		if (sid === "cardTypes") {
			_.each(rows, function(row, rid) {

				rIndex++;
				var params = row.getParams();
				if (params.selected) {
					selectedDeliveryIndex = rid;
					logger.debug("\n\n\n selectedDeliveryIndex 		", selectedDeliveryIndex, "\n\n\n");

				}
			});
		} else if (sid === "billingInfo") {
			_.each(rows, function(row, rid) {
				rIndex++;

				var params = row.getValues();
				logger.debug("\n\n\n params 		", JSON.stringify(params, null, 4), "\n\n\n");
				if (params) {
					if (params.address.trim() == "" || params.city.trim() == "" || params.state.trim() == "" || params.zip.trim() == "" || params.phone == "") {
						selectedDeliveryAddr = false;
					} else {
						selectedDeliveryAddr = true;
						selectedDeliveryAddressIndex = rid;

						logger.debug("\n\n\n selectedDeliveryAddressIndex 		", selectedDeliveryAddressIndex, "\n\n\n");

					}

				}
			});

		}
		count += rows.length;

	});

	if (selectedDeliveryIndex === -1) {
		$.uihelper.showDialog({
			message : "Please select a Delivery Option"
		});

		return;
	} else {
		_.each(sections, function(rows, sid) {
			if (sid === "cardTypes") {
				_.each(rows, function(row, rid) {
					if (rid === selectedDeliveryIndex) {
						logger.debug("\n\n\n rid 		", rid, "\n\n\n");

						var params = row.getParams();
						logger.debug("\n\n\n params 		", JSON.stringify(params, null, 4), "\n\n\n");

						Alloy.Collections.deliveryOptions.each(function(option, index) {
							if (option.get("deliveryOptions") == params.title) {
								option.set("selected", true);
							} else {
								option.set("selected", false);
							}
						});

						logger.debug("\n\n\n Alloy.Collections.deliveryOptions 		", JSON.stringify(Alloy.Collections.deliveryOptions, null, 4), "\n\n\n");

						$.utilities.setProperty(Alloy.CFG.show_saved_delivery_info, "1");

					}
				});
			}
		});
	}

	if (selectedDeliveryAddr === false) {
		$.uihelper.showDialog({
			message : "Please enter the complete Delivery Information"
		});

		return;
	} else {
		_.each(sections, function(rows, sid) {
			if (sid === "billingInfo") {
				_.each(rows, function(row, rid) {
					if (rid === selectedDeliveryAddressIndex) {
						var params = row.getValues();

						var updatedDeliveryAddress = {
							address : params.address.trim(),
							city : params.city.trim(),
							state : params.state.trim(),
							zip : params.zip.trim(),
							phone : params.phone,
							instructions : params.instructions ? (params.instructions.trim() === "" ? "none" : params.instructions.trim()) : "none"
						};
						var xyz = {
							deliveryAddress : updatedDeliveryAddress
						};

						currentPatient.set(xyz);
						logger.debug("\n\n\n currentPatient 		", JSON.stringify(currentPatient, null, 4), "\n\n\n");
						$.utilities.setProperty(Alloy.CFG.show_saved_delivery_info, "1");

					}
				});
			}
		});
		$.app.navigator.close();
	}
}

function didPostlayout(e) {
	$.bottomView.removeEventListener("postlayout", didPostlayout);
	var top = $.tableView.rect.height,
	    margin = $.tableView.bottom,
	    bottom;
	bottom = margin;

	//alert(top);  //empty
	// alert(margin);

	bottom = bottom + $.bottomView.height;
	$.tableView.applyProperties({
		bottom : bottom - 100
	});
	// $.bottomView.applyProperties({
	// top : margin
	// });

	/*
	 $.tableView.applyProperties({
	 top : $.tableView.top,
	 bottom : $.bottomView.top,
	 height : $.tableView.rect.height - $.bottomView.rect.height
	 });*/

}

function showLoader() {
	$.loader.show();
}

function hideLoader() {
	$.loader.hide(false);
}

function didClickDone(e) {
	$.cardInfoView.hide();
	$.submitBtn.title = Alloy.Globals.strings.prescAddBtnSubmit;
}

function terminate() {

}

exports.init = init;
exports.focus = focus;
exports.terminate = terminate;
