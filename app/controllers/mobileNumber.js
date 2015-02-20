var args = arguments[0] || {},
    app = require("core"),
    dialog = require("dialog"),
    utilities = require("utilities"),
    http = require("requestwrapper"),
    uihelper = require("uihelper");

function init() {
	uihelper.getImage($.logoImg);
}

function didChange(e) {
	var value = e.value,
	    len;
	value = value.replace('(', '').replace(')', '').replace(' ', '').replace('-', '');
	len = value.length;
	if (len >= 10) {
		value = '(' + value.substr(0, 3) + ')' + value.substr(3, 3) + '-' + value.substr(6, 4);
	} else if (len >= 7) {
		value = '(' + value.substr(0, 3) + ')' + value.substr(3, 3) + '-' + value.substr(6, 4);
	} else if (len >= 4) {
		value = '(' + value.substr(0, 3) + ')' + value.substr(3, 3);
	} else if (len > 0) {
		value = '(' + value.substr(0, len);
	}
	$.mobileTxt.setValue(value);
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
		});
	} else {
		dialog.show({
			message : Alloy.Globals.strings.valMobileNumberRequired
		});
	}
}

function didSuccess(_result, _passthrough) {
	var isExists = parseInt(_result.data.patients.mobile_exists),
	    isShared = parseInt(_result.data.patients.is_mobile_shared),
	    navigation = {
		stack : true,
		ctrlArguments : _passthrough
	};
	if (isExists) {
		_.extend(navigation, {
			ctrl : isShared ? "sharedMobileCheck" : "textToApp"
		});
	} else {
		_.extend(navigation, {
			ctrl : "fullSignup",
			titleid : "strSignup",
		});
	}
	app.navigator.open(navigation);
}

exports.init = init;
