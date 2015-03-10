var args = arguments[0] || {},
    app = require("core"),
    utilities = require("utilities");

function didClickType(e) {
	var scan = 1;
	app.navigator.open({
		ctrl : "refillTypeRx",
		titleid : "titleRefillNow",
		stack : true,
		ctrlArguments : {
			isScan : scan
		}
	});
}

function phoneDialer(e) {
	//alert("clicked");
	var number = "tel:+" + String(doctor.phone);
	Ti.Platform.openURL(number);
}

function didClickCallPharmacy(e) {
	var type = 1;

	var storeLastRefilledAt = utilities.getProperty(Alloy.CFG.STORE_LAST_REFILLED, {}, "object");

	if (_.isEmpty(storeLastRefilledAt)) {
		alert("Inside if");
	} else {
		alert(storeLastRefilledAt);
		Ti.Platform.openURL("tel:" + Alloy.CFG.SUPPORT.call);
	}
}