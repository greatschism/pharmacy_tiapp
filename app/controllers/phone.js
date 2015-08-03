var args = arguments[0] || {},
    app = require("core"),
    utilities = require("utilities"),
    http = require("requestwrapper"),
    uihelper = require("uihelper");

function init() {
	$.phoneTxt.setValue(Alloy.Models.patient.get("mobile_number") || $.strings.strNotAvailable);
	var len = $.phoneTxt.getValue().length;
	$.phoneTxt.setSelection(0, len);
}

function didChange(e) {
	var value = utilities.formatMobileNumber(e.value),
	    len = value.length;
	$.phoneTxt.setValue(value);
	$.phoneTxt.setSelection(len, len);
}

/* to do - complete this flow after registration flow is complete */

function didClickContinue(e) {
	var mobileNumber = utilities.validateMobileNumber($.phoneTxt.getValue());
	if (mobileNumber) {
		http.request({
			method : "patients_mobile_exists_or_shared",
			data : {
				data : [{
					patient : {
						mobile_number : mobileNumber
					}
				}]
			},
			passthrough : {
				mobileNumber : mobileNumber
			},
			success : didSuccess,
			failure : didFail,
			keepLoader : true
		});
	} else {
		uihelper.showDialog({
			message : Alloy.Globals.strings.valMobileNumberRequired
		});
	}
}

function didFail(error, passthrough) {
	app.navigator.hideLoader();
}

function didSuccess(result, passthrough) {
	var isExists = parseInt(result.data.patients.mobile_exists),
	    isShared = parseInt(result.data.patients.is_mobile_shared);
	if (isExists) {
		if (isShared) {
			app.navigator.hideLoader();
			app.navigator.open({
				ctrl : "sharedMobileCheck",
				stack : true,
				ctrlArguments : passthrough
			});
		} else {
			http.request({
				method : "patients_mobile_generate_otp",
				data : {
					filter : [{
						type : "mobile_otp"
					}],
					data : [{
						patient : {
							mobile_number : passthrough.mobileNumber
						}
					}]
				},
				passthrough : passthrough,
				success : didSendOTP
			});
		}
	} else {
		app.navigator.hideLoader();
		app.navigator.open({
			ctrl : "fullSignup",
			titleid : "strSignup",
			stack : true,
			ctrlArguments : passthrough
		});
	}
}

function didSendOTP(result, passthrough) {
	app.navigator.open({
		ctrl : "textToApp",
		stack : true,
		ctrlArguments : passthrough
	});
}

exports.init = init;
