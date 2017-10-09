var args = $.args,

    app = require("core"),
    http = require("requestwrapper"),
    utilities = require("utilities"),
    rx = require("rx"),
    apiCodes = Alloy.CFG.apiCodes,
    uihelper = require("uihelper"),
    moment = require("alloy/moment"),
    qrcode = require('ti-qrcode-master/qrcode');

var checkoutDetails = {};

function init() {
	if (Alloy.Globals.isLoggedIn) {
		getCheckoutInfo();
	}



	Ti.API.info("xpress  " + JSON.stringify($.xpressView))
	var qrCodeView = new qrcode('This holds the data of the qr code we are supposed to render');
	Ti.API.info("qrCodeView  " + JSON.stringify($.qrCodeView))
	$.xpressView.add(qrCodeView);
	// ^^^^^ putting this here on init simply to display POC of showing QR code.  Actual implementation will show QR code later.
}

function didFail(result, passthrough) {
	/**
	 * if something goes odd with api
	 * just close this screen to
	 * prevent any further actions
	 */
	$.app.navigator.hideLoader();
	$.app.navigator.close();
}

function getCheckoutInfo() {
	$.http.request({
		method : "prescriptions_express_checkout_info",
		params : {
			data : []
		},
		errorDialogEnabled : true,
		success : didGetCheckoutDetails,
		failure : checkoutDetailsFail
	});
}

function checkoutDetailsFail() {
	popToHome();
}

function didGetCheckoutDetails(result) {
	if(result.data.stores.length > 1)
	{
		uihelper.showDialog({
			message : Alloy.Globals.strings.expressCheckoutMultipleStoreMsg,
			buttonNames : [Alloy.Globals.strings.dialogBtnClose],
			success : popToHome
		});
	}
}

function popToHome() {
	$.app.navigator.open(Alloy.Collections.menuItems.findWhere({
		landing_page : true
	}).toJSON());
}

function didClickGenerateCode(e) {
	var dob = $.dob.getValue();

	if (!dob) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.registerValDob
		});
		return;
	}
	// birth_date : moment(dob).format(Alloy.CFG.apiCodes.dob_format),

/*
	Ti.API.info("xpress  " + JSON.stringify($.xpressView))
	var qrCodeView = new qrcode('This holds the data of the qr code we are supposed to render');
	Ti.API.info("qrCodeView  " + JSON.stringify($.qrCodeView))
	$.xpressView.add(qrCodeView);
*/

}

function setParentView(view) {
	$.dob.setParentView(view);
}

exports.init = init;
exports.setParentView = setParentView;
