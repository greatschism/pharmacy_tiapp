var args = arguments[0] || {},
    rxnos = [],
    app = require("core"),
    viewArr = [],
    i = 0,
    utilities = require("utilities"),
    http = require("requestwrapper"),
    uihelper = require("uihelper"),
    deleteBtn,

    addPres,
    mob,
    locationFirstUpdate = true;

function init() {
	Alloy.Models.store.on("change", updateStore);
}

function didChange(e) {
	var value = utilities.formatMobileNumber(e.value),
	    len = value.length;
	$.mobileNumber.setValue(value);
	$.mobileNumber.setSelection(len, len);
}

function choosePharmacy(e) {
	app.navigator.open({
		titleid : "titleStores",
		ctrl : "stores",
		ctrlArguments : {
			orgin : "refillTyprRx"
		},
		stack : true
	});
}

function updateStore() {
	if (locationFirstUpdate) {
		locationFirstUpdate = false;
		$.locationLbl.color = Alloy._fg_secondary;
	}
	$.locationLbl.text = Alloy.Models.store.get("addressline1");
}

function didClickOrderRefill(e) {

	mob = $.mobileNumber.getValue();

	if (mob !== "") {
		http.request({
			method : "PRESCRIPTIONS_REFILL",
			data : {

				"client_identifier" : "x",
				"version" : "x",
				"session_id" : "x",
				"filter" : [{
					"refill_type" : "quick/scan/text"
				}],
				"data" : [{
					"prescriptions" : [{
						id : "x",
						rx_number : rxnos[0],
						store_id : "x",
						mobile_number : "x",
						pickup_time_group : "x",
						pickup_mode : "instore/mailorder",
						barcode_data : "x",
						barcode_format : "x"
					}, {

						id : "x",
						rx_number : viewArr,
						store_id : "x",
						mobile_number : mob,
						pickup_time_group : "x",
						pickup_mode : "instore/mailorder",
						barcode_data : "x",
						barcode_format : "x"
					}]
				}]
			},
			success : didSuccess,
		});

	} else {
		alert("Please enter valid details for all fields !!");
	}
}

function didSuccess(e) {
	uihelper.showDialog({
		message : "Your refill has been placed successfully",
		success : function() {
			app.navigator.closeToRoot();
		}
	});
	/*app.navigator.open({
	titleid : "titleOrderDetails",
	ctrl : "refillSuccess",
	stack : true
	});*/
	//alert("Under Construction");
}

function didClickAddPrescription(e) {
	if (i < 11) {

		rxnos[0] = $.RxHintLbl.getValue();
		//count++;

		viewArr[i] = $.UI.create("View", {
			apiName : "View",
			classes : ["padding-top", "auto-height"],

		});

		addPres = Alloy.createWidget("ti.textfield", "widget", $.createStyle({
			classes : ["form-txt", "txt", "padding-top"],
			rightIconText : Alloy.CFG.icons.minus_with_circle,
			iconFont : Alloy.TSS.small_icon.font,
			rightIconDict : {
				"Color" : "#ED1C24",
				"right" : 10

			},
			keyboardType : Ti.UI.KEYBOARD_NUMBER_PAD,
			maxLength : 7,

		}));

		addPres.applyProperties({
			hintText : Alloy.Globals.strings.hintRxNo,

		});

		$.enter.add(addPres.getView());

		console.log("entered func");
		addPres.on('click', function(e) {

			console.log(e);

			$.enter.remove(e.source.getView());
			i--;

		});

		i++;

	} else {
		alert("Maximum limit reached !!");
	}
}

function terminate() {
	Alloy.Models.store.off("change", updateStore);
}

exports.init = init;
exports.terminate = terminate;
