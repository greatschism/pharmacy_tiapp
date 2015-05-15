var args = arguments[0] || {},
    app = require("core"),
    utilities = require("utilities"),
    http = require("requestwrapper"),
    uihelper = require("uihelper");

function init() {
	uihelper.getImage($.logoImg);
}

function didChange(e) {
	var value = utilities.formatMobileNumber(e.value),
	    len = value.length;
	$.mobileTxt.setValue(value);
	$.mobileTxt.setSelection(len, len);
}

function didClickContinue(e) {
	var mobileNumber = utilities.validateMobileNumber($.mobileTxt.getValue());
	if (mobileNumber) {
		http.request({
			method : "PATIENTS_MOBILE_EXISTS_OR_SHARED",
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

function didFail(_error, _passthrough) {
	app.navigator.hideLoader();
}

function didSuccess(_result, _passthrough) {
	var isExists = parseInt(_result.data.patients.mobile_exists),
	    isShared = parseInt(_result.data.patients.is_mobile_shared);
	if (isExists) {
		if (isShared) {
			app.navigator.hideLoader();
			app.navigator.open({
				ctrl : "sharedMobileCheck",
				stack : true,
				ctrlArguments : _passthrough
			});
		} else {
			http.request({
				method : "PATIENTS_MOBILE_GENERATE_OTP",
				data : {
					filter : [{
						type : "mobile_otp"
					}],
					data : [{
						patient : {
							mobile_number : _passthrough.mobileNumber
						}
					}]
				},
				passthrough : _passthrough,
				success : didSendOTP
			});
		}
	} else {
		app.navigator.hideLoader();
		app.navigator.open({
			ctrl : "fullSignup",
			titleid : "strSignup",
			stack : true,
			ctrlArguments : _passthrough
		});
	}
}

function didSendOTP(_result, _passthrough) {
	app.navigator.open({
		ctrl : "textToApp",
		stack : true,
		ctrlArguments : _passthrough
	});
}

exports.init = init;
