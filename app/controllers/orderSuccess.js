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
    getPrescriptions,
    prescNamesArray,
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

function didSuccessRefill(_result) {

	// response of refill prescriptions
	refillPrescriptions = _result.data.prescriptions || [];

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
				left : 50,
				classes : ["list-item-title-lbl"]
			}),
			readyByDateLabel = $.UI.create("Label", {
				apiName : "Label",
				left : 50,
				classes : ["list-item-info-lbl", "left"]
			});

			listItemView.add(rxLabel);
			listItemView.add(readyByDateLabel);
			padView.add(orderPickUpLblIcon);
			row.add(padView);
			row.add(listItemView);
			$.gettingRefilledSection.add(row);

			if (refillPrescriptions[i].refill_is_error = true) {
				orderPickUpLblIcon.text = Alloy.CFG.icons.checkbox;
			} else {
				orderPickUpLblIcon.text = Alloy.CFG.icons.unfilled_success;
			}

			if (refillPrescriptions.length) {

				http.request({
					method : "PRESCRIPTIONS_GET",
					data : {
						filter : null,
						get_type : "",
						data : [{
							id : "",
							prescriptions : ""

						}]

					},
					success : function(result) {

						//response of prescriptions get
						getPrescriptions = result.data.prescriptions;
						prescNamesArray = new Array;

						k = 0;
						for ( i = 0; i < refillPrescriptions.length; i++) {

							for ( j = 0; j < getPrescriptions.length; j++) {

								if (getPrescriptions[j].rx_number === refillPrescriptions[i].rx_number_id) {

									prescNamesArray[k] = getPrescriptions[j];
									console.log("helllllll" + prescNamesArray);
									k++;
									break;

								}

							}
							rxLabel.text = prescNamesArray[0].presc_name;

						}
						console.log("how many" + prescNamesArray.length);
					

					}
				});

			}

			rxLabel.text = refillPrescriptions[i].presc_name;
			console.log("jdfhfdhjfdhj" + refillPrescriptions[i].presc_name);
			if (refillPrescriptions[i].refill_promised_date) {
				readyByDateLabel.text = strings.msgShouldBeReadyBy + " " + refillPrescriptions[i].refill_promised_date;
			} else {
				readyByDateLabel.text = "";
			}

		}

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

