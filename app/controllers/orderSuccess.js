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
    getPrescriptions,
    prescNamesArray,
    prescriptions,
    addr,
    allPrescriptions;

function init() {
	http.request({
		method : "prescriptions_refill",
		success : didSuccessRefill
	});
}

function didClickDone(result, passthrough) {
	app.navigator.open({
		ctrl : "orderDetails",
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

function didSuccessRefill(result) {

	// response of prescriptions refill
	refillPrescriptions = result.data.prescriptions || [];
	console.log("refill prescriptions" + refillPrescriptions);

	//if (refillPrescriptions.length) {
	for ( i = 0; i < refillPrescriptions.length; i++) {
		var data = [];
		http.request({
			method : "prescriptions_get",
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
						//matching rx numbers
						if (getPrescriptions[j].rx_number === refillPrescriptions[i].rx_number_id) {
							// if matching add all in another array
							prescNamesArray[k] = getPrescriptions[j];
							console.log("newly added " + prescNamesArray[i].presc_name);

							k++;
						}

					}

				}

				console.log("how many" + prescNamesArray.length);

			}
		});

		//for (var i in refillPrescriptions) {
		data.push(getRow({
			name : prescNamesArray[0].presc_name,
			refill_promised_date : refillPrescriptions[0].refill_promised_date,
			refill_is_error : refillPrescriptions[0].refill_is_error,
			refill_inline_message : refillPrescriptions[0].refill_inline_message

		}));
		//	}

		$.tableView.setData(data);
	}
	//}
	// else{
	// data.push(getRow({
	// name :prescNamesArray[0].presc_name,
	// refill_promised_date : refillPrescriptions[0].refill_promised_date,
	// refill_is_error : refillPrescriptions[0].refill_is_error,
	// refill_inline_message : refillPrescriptions[0].refill_inline_message
	//
	// }));
	// }
}

function getRow(data) {

	$.hintParaOne.text = strings.msgRefillOrder + " " + data.refill_promised_date;
	$.tableView.top = 50;
	console.log(data);
	var row = $.UI.create("TableViewRow", {
		apiName : "TableViewRow",
		classes : ["height-75d"],

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
		classes : ["left", "large-icon", "success-color"]

	});

	rxLabel = $.UI.create("Label", {
		apiName : "Label",
		left : 50,
		text : data.name,
		classes : ["list-item-title-lbl"]
	}),
	readyByDateLabel = $.UI.create("Label", {
		apiName : "Label",
		left : 50,
		text : "Should be ready by" + " " + data.refill_promised_date,
		classes : ["list-item-info-lbl", "left"]
	});

	listItemView.add(rxLabel);
	listItemView.add(readyByDateLabel);
	if (data.refill_is_error = true) {

		orderPickUpLblIcon.text = Alloy.CFG.icons.checkbox;

	} else if (data.refill_is_error = false) {
		orderPickUpLblIcon.text = Alloy.CFG.icons.unfilled_success;
	}

	padView.add(orderPickUpLblIcon);
	row.add(padView);
	row.add(listItemView);

	row.addEventListener("click", didItemClick);
	return row;
}

function didToggle(e) {
	$.toggleMenu.toggle();
}

function didItemClick(e) {
	console.log("pratibha");

}

exports.init = init;

