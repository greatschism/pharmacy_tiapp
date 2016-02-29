var args = $.args,
    refillScan = require("refillScan");

function didClickScan(e) {
	/**
	 * open barcode scanner directly
	 * when phone number is disabled
	 */
	if (Alloy.CFG.refill_scan_phone_enabled) {
		$.app.navigator.open({
			titleid : "titleRefill",
			ctrl : "refillPhone",
			stack : true
		});
	} else {
		refillScan.init($);
	}
}

function didClickType(e) {
	$.app.navigator.open({
		titleid : "titleRefillType",
		ctrl : "refillType",
		stack : true
	});
}