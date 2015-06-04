var args = arguments[0] || {},
    app = require("core"),
    utilities = require("utilities"),
    http = require("requestwrapper"),
    cached = " ",
    prepopulated_number = "",
    uihelper = require("uihelper");

function init() {
	console.log("init trigg");
	if ((OS_IOS || OS_ANDROID) && (cached != 0 || cached != "" )) {
		//utilities.setProperty(Alloy.CFG.pharmacy_phone_last_used, $.mobileTxt.getValue(), "string", false);
		prepopulated_number = utilities.getProperty(Alloy.CFG.pharmacy_phone_last_used, cached, "string", false);
		$.mobileTxt.setValue(prepopulated_number);
		console.log("prepopulated_number" + prepopulated_number);
	}
	console.log("ios");
}

function didChange(e) {
	console.log("didchng");
	var value = utilities.formatMobileNumber(e.value),
	    len = value.length;
	$.mobileTxt.setValue(value);
	$.mobileTxt.setSelection(len, len);
}

function didClickContinue(e) {
	var mob = $.mobileTxt.getValue();
	cached = utilities.setProperty(Alloy.CFG.pharmacy_phone_last_used, mob, "string", false);
	console.log("cached" + (cached));
	if (isNaN(mob) == true && mob.length == 14) {
		if (args.isScan == 1) {
			var Barcode = require('com.mfogg.barcode');
			Ti.API.info("module is => " + Barcode);

			// open a single window
			var win = Ti.UI.createWindow({
				backgroundColor : "#eee"
			});

			var allowed_upcs = ["EAN2", "EAN5", "EAN8", "UPCE", "ISBN10", "UPCA", "EAN13", "ISBN13", "COMPOSITE", "I25", "DATABAR", "DATABAR_EXP", "CODE39", "PDF417", "CODE93", "CODE128"];

			var cameraView = Barcode.createView({
				top : 0,
				height : Ti.UI.FILL,
				width : Ti.UI.FILL,
				backgroundColor : "#fff",
				barcodes : allowed_upcs
			});

			cameraView.addEventListener("success", function(event) {
				win.close();
				alert("Scanned Successfully \n " + event.data);
			});
			win.add(cameraView);
			win.open();

			var cancelButton = Ti.UI.createButton({
				bottom : 60,
				title : "Cancel",
				color : "#000000",
				width : 180,
				backgroundColor : "#FFFFFFF",
				borderRadius : 4,
				opacity : 0.5,
				height : 50,
				font : {
					fontSize : 18,
					fontWeight : "bold"
				}
			});
			cancelButton.addEventListener("click", function() {
				win.close();
			});
			cameraView.add(cancelButton);

		} else if (args.isTyped == 1) {
			app.navigator.open({
				ctrl : "refillTypeRx",
				titleid : "titleOrderDetails",
				stack : true

			});
		}
	} else {
		alert("please enter a valid 10 digit number");
	}
}

exports.init = init;
