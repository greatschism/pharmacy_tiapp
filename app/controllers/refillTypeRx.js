var args = arguments[0] || {},
    rxnos = [],
    app = require("core"),
    viewArr=[],
    i=0,
    dialog = require("dialog"),
    utilities = require("utilities"),
    http = require("requestwrapper"),
    uihelper = require("uihelper"),
    deleteBtn,
    count = 0,
    addPres,
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
					"id" : "x",
					"rx_number" : "x",
					"store_id" : "x",
					"mobile_number" : "x",
					"pickup_time_group" : "x",
					"pickup_mode" : "instore/mailorder",
					"barcode_data" : "x",
					"barcode_format" : "x"
				}, 
				{

					id: "x",
					rx_number: "x",
					store_id: "x",
					mobile_number: "x",
					pickup_time_group: "x",
					pickup_mode : "instore/mailorder",
					barcode_data : "x",
					barcode_format : "x"
				}]
			}]
		}
	});

	app.navigator.open({
		titleid : "titleRefillStatus",
		ctrl : "refillSuccess",
		stack : true
	});
	alert("Under Construction");
}

function didClickAddPrescription(e) {
	rxnos[0] = $.RxHintLbl.getValue();
	count++;

	viewArr[i] = $.UI.create("View", {
		apiName : "View",
		classes : ["padding-top", "auto-height"],

	});

	addPres = Alloy.createWidget("com.mscripts.textfield", "widget", $.createStyle({
		classes : ["form-txt", "txt"],
		rightIconText : Alloy.CFG.icons.minus_with_circle,
		maxLength : 7,
		keyboardType : Ti.UI.KEYBOARD_NUMBER_PAD

	}));

	addPres.applyProperties({
		hintText : Alloy.Globals.strings.hintRefillThisPrescription,

	});

	viewArr[i].add(addPres.getView());
	$.enter.add(viewArr[i]);
	rxnos[count] = addPres.getValue();
	console.log((rxnos));
	console.log(i);
	console.log(addPres.getValue());
	addPres.on("click", didClickDelete);
	viewArr[i].bindId=i;
i++;
}

//addPres.on("click", didClickDelete);
function didClickDelete(e) {
	console.log(e.source.bindId);
	console.log(e);
	count--;
	$.enter.remove(viewArr[e.source.bindId]);
	//didClickAddPrescription();
}

function terminate() {
	Alloy.Models.store.off("change", updateStore);
}

exports.init = init;
exports.terminate = terminate;
