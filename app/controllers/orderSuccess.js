var args = arguments[0] || {},
    moment = require("alloy/moment"),
    app = require("core"),
    uihelper = require("uihelper"),
    http = require("requestwrapper"),
    utilities = require("utilities"),
    dialog = require("dialog"),
    icons = Alloy.CFG.icons,
    strings = Alloy.Globals.strings,
    DUE_FOR_REFILL_IN_DAYS = Alloy._due_for_refill_in_days,
    msgPickup = Alloy.Globals.strings.msgPickup,
    gettingRefilled,
    inprocessPrescriptions,
    readyToRefill,
    otherPrescriptions,
    refillPrescriptions,
    filteredStores,
    finalFilteredStores,
    prescriptions,
    addr,
//row,
    allPrescriptions,
    currentSwipeView;

function init() {
	http.request({
		method : "PRESCRIPTIONS_REFILL",
		success : didSuccessRefill
	});
}

function didClickDone(_result, _passthrough) {
	app.navigator.open({
		ctrl : "orderDetails",
		titleid : "",
		stack : false,
		ctrlArguments : _passthrough
	});
}

function addRx(str) {
	var strTemp = "Rx# ";
	str = strTemp + str;
	return str;
}

function didSuccessStores(_result) {
	addr = _result.data.stores || [];

}

function didSuccessRefill(_result) {

	refillPrescriptions = _result.data.prescriptions || [];

	if (refillPrescriptions.length) {

		for ( i = 0; i < refillPrescriptions.length; i++) {

			if (refillPrescriptions[i].refill_is_error == true) {

			} else {

			}

		}

	}

	$.gettingRefilledSection = uihelper.createTableViewSection($, strings.msgRefillOrder);
	{
		for (var i in refillPrescriptions) {
			row = $.UI.create("TableViewRow", {
				apiName : "TableViewRow",

			}),

			padView = $.UI.create("View", {
				apiName : "View",
				classes : ["list-item-view", "vgroup"]
			}),
			listItemView = $.UI.create("View", {
				apiName : "View",
				classes : ["list-item-view", "vgroup"]
			}),
			orderPickUpLblIcon = $.UI.create("Label", {
				apiName : "Label",
				classes : ["large-icon", "left", "success-color"],

			});
			rxLabel = $.UI.create("Label", {
				apiName : "Label",
				classes : ["list-item-title-lbl"]
			}),
			readyByDateLabel = $.UI.create("Label", {
				apiName : "Label",
				classes : ["list-item-info-lbl", "left"]
			}), orderPickUpLblIcon.text = Alloy.CFG.icons.checked;
			rxLabel.left = 50;
			readyByDateLabel.left = 50;
			rxLabel.text = addRx(refillPrescriptions[i].rx_number_id);
			if (refillPrescriptions[i].refill_promised_date) {
				readyByDateLabel.text = strings.msgShouldBeReadyBy + " " + refillPrescriptions[i].refill_promised_date;
			} else {
				readyByDateLabel.text = "";
			}

			listItemView.add(rxLabel);
			listItemView.add(readyByDateLabel);
			padView.add(orderPickUpLblIcon);
			row.add(padView);
			row.add(listItemView);
			$.gettingRefilledSection.add(row);
		}
		//$.gettingRefilledSection.add(row);
	}

	$.tableView.data = [$.gettingRefilledSection];

}

function didToggle(e) {
	$.toggleMenu.toggle();
}

function didItemClick(e) {
	console.log("jhf");

}

exports.init = init;

