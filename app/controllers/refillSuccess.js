var args = arguments[0] || {},
    moment = require("alloy/moment"),
    app = require("core"),
    uihelper = require("uihelper"),
    http = require("requestwrapper"),
    utilities = require("utilities"),
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
		method : "patients_authenticate",
		success : didSuccessAuthenticate
	}), http.request({
		method : "prescriptions_refill",
		success : didSuccessRefill
	});
}

function didSignUp(result, passthrough) {
	app.navigator.open({
		ctrl : "fullSignup",
		titleid : "",
		stack : true,
		ctrlArguments : passthrough
	});
}

function didClickDone(result, passthrough) {
	app.navigator.open({
		ctrl : "home",
		titleid : "",
		stack : false,
		ctrlArguments : passthrough
	});
}

function addRx(str) {
	var strTemp = "Rx# ";
	str = strTemp + str;
	return str;
}

function didSuccessAuthenticate(result, passthrough) {
	console.log("apisucc");
	var res = result.data.patients || [];
	if (res.session_id) {
		$.signup.show();
	} else {
		$.hintParaOne.hide();
		$.signup.hide();
	}
}

function didSuccessStores(result) {
	addr = result.data.stores || [];

}

function didSuccessRefill(result) {

	//Alloy.CFG.REFILL_SUCCESS=1;

	refillPrescriptions = result.data.prescriptions || [];

	$.addressSection = uihelper.createTableViewSection($, strings.msgRefillPlaced);
	{

		row = $.UI.create("TableViewRow", {
			apiName : "TableViewRow",
			classes : ["height-75d"],

		}),
		content = $.UI.create("View", {
			apiName : "View",
			classes : ["list-item-view"]
		}),
		contentAddress = $.UI.create("View", {
			apiName : "View",
			classes : ["list-item-info-lbl"]
		}),
		contentPhoneNumber = $.UI.create("View", {
			apiName : "View",
			classes : ["list-item-info-lbl", "h2"]
		}),
		storename = $.UI.create("Label", {
			apiName : "Label",
			classes : ["list-item-title-lbl", "left"]
		}),

		addressline1 = $.UI.create("Label", {
			apiName : "Label",
			classes : ["list-item-info-lbl", "padding-left"]
		}),
		phonenumber = $.UI.create("Label", {
			apiName : "Label",
			classes : ["list-item-info-lbl", "padding-left", "h2"]
		}), content.add(storename);
		contentAddress.add(addressline1);
		contentPhoneNumber.add(phonenumber);
		contentAddress.top = "40";
		contentPhoneNumber.top = "60";
		row.add(contentPhoneNumber);
		row.add(contentAddress);
		row.add(content);
		$.addressSection.add(row);
		if (refillPrescriptions.length) {

			http.request({
				method : "STORES_GET",
				data : {
					filter : null,
					get_type : "",
					data : [{
						id : "",
						stores : ""

					}]

				},
				success : function(result) {
					filteredStores = result.data.stores;
					finalFilteredStores = new Array;

					k = 0;
					for ( i = 0; i < refillPrescriptions.length; i++) {

						for ( j = 0; j < filteredStores.length; j++) {

							if (filteredStores[j].store_id === refillPrescriptions[i].refill_store_id) {

								//console.log(filteredStores[j]);

								finalFilteredStores[k] = filteredStores[j];
								k++;
								break;

							}

						}
					}

					console.log(finalFilteredStores);
					storename.text = finalFilteredStores[0].store_name;
					addressline1.text = finalFilteredStores[0].addressline1 + "," + finalFilteredStores[0].state + " " + finalFilteredStores[0].zip;
					phonenumber.text = "Call: " + finalFilteredStores[0].phone;

				}
			});
		}

	}

	$.gettingRefilledSection = uihelper.createTableViewSection($, strings.sectionPrescriptionRefilled);
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

	$.tableView.data = [$.addressSection, $.gettingRefilledSection];

}

function didToggle(e) {
	$.toggleMenu.toggle();
}

function didItemClick(e) {
	console.log("jhf");

}

exports.init = init;

