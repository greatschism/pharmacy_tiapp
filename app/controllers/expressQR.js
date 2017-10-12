var args = $.args,
    qrcode = require('ti-qrcode-master/qrcode'),
    utilities = require("utilities"),
    expressCounter;

function init() {
	var qrCodeView = new qrcode(args.checkout);
	$.qrHolderView.add(qrCodeView);
	
	var currentPatient = Alloy.Collections.patients.findWhere({
		selected : true
	});
	var	patient_id = currentPatient.get("parent_id") || currentPatient.get("child_id");
	var exp_counter_key = "expressCounterFor_" + patient_id;
	
	expressCounter = setInterval(function(){
	    if (!require("authenticator").isExpressCheckoutValid(exp_counter_key)) {
	    	$.uihelper.showDialog({
				message : Alloy.Globals.strings.expressQRCounterExpired,
				cancelIndex : 1,
				success : function closeQRScreen() {
					$.app.navigator.close();
				}
			});
	        clearInterval(expressCounter);
	    }
	}, 60000 * 5);
}


function didClickDone() {
	clearInterval(expressCounter);
	$.app.navigator.open(Alloy.Collections.menuItems.findWhere({
		landing_page : true
	}).toJSON());
}

function backButtonHandler() {
	didClickDone();
}

exports.init = init;
exports.backButtonHandler = backButtonHandler;