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
		utilities.setProperty(Alloy.CFG.latest_phone_used, $.mobileTxt.getValue(), "string", false);
		prepopulated_number = utilities.getProperty(Alloy.CFG.PHARMACY_PHONE_LAST_USED, cached, "string", false);
		$.mobileTxt.setValue(prepopulated_number);
		console.log("prepopulated_number" + prepopulated_number);
	}
	console.log("ios");
}

function didChange(e) {
	console.log("didchng");
	var value = utilities.formatPhoneNumber(e.value),
	    len = value.length;
	$.mobileTxt.setValue(value);
	$.mobileTxt.setSelection(len, len);
}

function didClickContinue(e) {

	var mob = $.mobileTxt.getValue();
	console.log("mob" + mob);
	cached = utilities.setProperty(Alloy.CFG.latest_phone_used, mob, "string", false);
	console.log("cached" + (cached));

	require("barcode").capture({
		success : function(event) {
			console.log(event.result);
			$.http.request({
				method : "prescriptions_refill",
				params : {
					feature_code : "THXXX",

					filter : {
						refill_type : "scan"
					},
					data : [{
						prescriptions : [{
							id : "x",
							rx_number : "x",
							store_id : "x",
							mobile_number : mob,
							pickup_time_group : "x",
							pickup_mode : "instore",
							barcode_data : event.result,
							barcode_format : "code-128"
						}]
					}]
				},
				success : didSuccessRefill,
				failure : didFailRefill

			});
		}
	}, $);

}

function didSuccessRefill() {
	app.navigator.open({
		ctrl : "refillSuccess",
		titleid : "titleQuickRefill",
		stack : true,
	});

}
function didFailRefill(){
	app.navigator.open({
		ctrl : "refillFailure",
		titleid : "titleRefillFailure",
		stack : true,
	});
}
exports.init = init;
