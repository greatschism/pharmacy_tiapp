var args = $.args,
    refillScan = require("refillScan");

function didClickScan(e) {
	/**
	 * open barcode scanner directly
	 * when phone number is disabled
	 */
	
	if(!Titanium.Media.hasCameraPermissions()){
		Titanium.Media.requestCameraPermissions(function(result){
			if(!result.success) {
				$.uihelper.showDialog({
					message : $.strings.msgDenyFeaturePermission
				});
				$.analyticsHandler.trackEvent("RefillByScan", "click", "DeniedCameraPermission");
			} else {
				callScanner();
			}
		});
	} else {
		callScanner();
	}
	
}

function callScanner(){
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
	Alloy.Globals.isMailOrderService = false;

	$.app.navigator.open({
		titleid : "titleRefillType",
		ctrl : "refillType",
		stack : true
	});
}