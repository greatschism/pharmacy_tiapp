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
    allPrescriptions,
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

function didSuccessStores(_result) {
	addr = _result.data.stores || [];

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
				classes : ["list-item-title-lbl"]
			}),
			readyByDateLabel = $.UI.create("Label", {
				apiName : "Label",
				classes : ["list-item-info-lbl", "left"]
			}), orderPickUpLblIcon.text = Alloy.CFG.icons.checkbox;
			rxLabel.left = 50;
			readyByDateLabel.left = 50;

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
						allPrescriptions = result.data.prescriptions;
						prescNamesArray = new Array;

						k = 0;
						for ( i = 0; i < refillPrescriptions.length; i++) {

							for ( j = 0; j < allPrescriptions.length; j++) {

								if (allPrescriptions[j].rx_number === refillPrescriptions[i].rx_number_id) {

									prescNamesArray[k] = allPrescriptions[j];
									k++;
									break;

								}

							}
						
						}

						console.log("yoooooooo" + prescNamesArray);
					
                     //	rxLabel.text = prescNamesArray[i].presc_name;
					}
				});

			}


		    rxLabel.text = "Lovatino, 50mg tab";
			console.log(refillPrescriptions[i].presc_name);
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

