var args = $.args,

    app = require("core"),
    http = require("requestwrapper"),
    utilities = require("utilities"),
    rx = require("rx"),
    apiCodes = Alloy.CFG.apiCodes,
    uihelper = require("uihelper"),
    moment = require("alloy/moment"),
    authenticator = require("authenticator"),
    checkout_result,
    currentPatient,
    exp_counter_key;

var checkoutDetails = {};

function init() {
	if (Alloy.Globals.isLoggedIn) {
		getCheckoutInfo();
	}
	currentPatient = Alloy.Collections.patients.findWhere({
		selected : true
	});
	exp_counter_key = currentPatient.get("email_address") + "_" + currentPatient.get("email_address") + "_exp_counter";
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
	if (result.data.stores.length > 1) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.expressCheckoutMultipleStoreMsg,
			buttonNames : [Alloy.Globals.strings.dialogBtnClose],
			success : popToHome
		});

	} else if (result.data.stores.length == 1) {
		if (authenticator.isExpressCheckoutValid(exp_counter_key)) {
			moveToExpressQR(currentPatient, checkout_result);
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

	var patientDob = moment(currentPatient.get("birth_date")).format(Alloy.CFG.apiCodes.dob_format);
	var inputDob = moment(dob).format(Alloy.CFG.apiCodes.dob_format);
  var dobMatch = OS_IOS ? moment(dob).diff(patientDob, "days") == 0 : moment(inputDob).diff(patientDob, "days") == 0;
	if(dobMatch) {
		var timeNow = moment();
		utilities.setProperty(exp_counter_key, timeNow, "object", false);
		moveToExpressQR(currentPatient, checkout_result);
	} else {
		uihelper.showDialog({
			message : Alloy.Globals.strings.expressCheckoutDobMismatchMsg
		});
		return;
	}
}

function moveToExpressQR(patient, checkoutInfo) {
	var first_name = patient.get("first_name");
	var last_name = patient.get("last_name");
	var rx_nnumber = checkoutInfo.data.stores[0].prescription[0].rx_number;
	var checkout_qr = last_name + "," + first_name + "," + rx_nnumber;
	app.navigator.open({
		ctrl : "expressQR",
		titleid : "titleExpressQR",
		ctrlArguments : {
			checkout : checkout_qr
		},
		stack : true
	});
}

function setParentView(view) {
	$.dob.setParentView(view);
}

exports.init = init;
exports.setParentView = setParentView;
