var args = $.args,
    refillScan = require("refillScan");
    
function focus(e) {
	$.refillView.accessibilityHidden = false;
}

function didClickScan(e) {
	/**
	 * open barcode scanner directly
	 * when phone number is disabled
	 */

	if (!Titanium.Media.hasCameraPermissions()) {
		Titanium.Media.requestCameraPermissions(function(result) {
			if (!result.success) {
				$.uihelper.showDialogWithButton({
					message : Alloy.Globals.strings.msgDenyFeaturePermission,
					deactivateDefaultBtn : true,
					btnOptions : [{
						title : Alloy.Globals.strings.dialogBtnSettings,
						onClick : $.uihelper.openSettings
					}, {
						title : Alloy.Globals.strings.dialogBtnCancel
					}]
				});
				// $.analyticsHandler.trackEvent("RefillByScan", "click", "DeniedCameraPermission");
			} else {
				callScanner();
			}
		});
	} else {
		callScanner();
	}

}


function callScanner() {
	if (OS_IOS) {		
		$.refillView.accessibilityHidden = true;
	};
	if (Alloy.CFG.refill_scan_phone_enabled) {
		$.app.navigator.open({
			titleid : "titleRefill",
			ctrl : "refillPhone",
			stack : true,
			ctrlArguments : {
				callback : focus
			},
		});
	} else {
		refillScan.init($, undefined, focus);
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

exports.focus = focus;