var args = arguments[0] || {},
    app = require("core"),
    utilities = require("utilities"),
    dialog = require("dialog"),
    http = require("requestwrapper");

function didClickSend(e) {
	var email = $.emailTxt.getValue();
	if (utilities.validateEmail(email)) {
		//		app.navigator.open({
		//			ctrl : "newPassword",
		//			titleid : "strNewPassword"
		http.request({
			method : "PATIENTS_FORGOT_PASSWORD",
			data : {
				data : [{
					patient : {
						user_name : "",
						email_address : email,
						password : ""
					}
				}]
			},
			success : didAuthenticate
		});
	} else {
		dialog.show({
			message : Alloy.Globals.strings.valEmailRequired
		});
	}
}

function didAuthenticate(_result) {
	//to do
	dialog.show({
		message : _result.message
	});
}
