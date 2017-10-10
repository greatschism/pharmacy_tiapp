var args = $.args,

    app = require("core"),
    http = require("requestwrapper"),
    utilities = require("utilities"),
    rx = require("rx"),
    apiCodes = Alloy.CFG.apiCodes,
    uihelper = require("uihelper"),
    moment = require("alloy/moment"),
    checkout_result;

var checkoutDetails = {};

function init() {
	if (Alloy.Globals.isLoggedIn) {
		getCheckoutInfo();
	}
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
	checkout_result = result;
	if(result.data.stores.length > 1)
	{
		uihelper.showDialog({
			message : Alloy.Globals.strings.expressCheckoutMultipleStoreMsg,
			buttonNames : [Alloy.Globals.strings.dialogBtnClose],
			success : popToHome
		});
	} else if(result.data.stores.length == 1) {
		if (require("authenticator").isExpressCheckoutValid()) {
			moveToExpressQR();
		} else {
			$.parentView.visible = true;
		}
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
	moveToExpressQR();
}

function moveToExpressQR() {
	app.navigator.open({
		ctrl : "expressQR",
		titleid : "titleExpressQR",
		ctrlArguments : {
			checkout : checkout_result
		},
		stack : true
	});
}

function setParentView(view) {
	$.dob.setParentView(view);
}

exports.init = init;
exports.setParentView = setParentView;
