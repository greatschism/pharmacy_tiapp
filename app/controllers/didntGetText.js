var args = arguments[0] || {},
    app = require("core"),
    http = require("requestwrapper"),
    moment = require("alloy/moment");

function didClickSendAgain(e) {
	http.request({
		method : "PATIENTS_MOBILE_GENERATE_OTP",
		data : {
			filter : [{
				type : "mobile_otp"
			}],
			data : [{
				patient : {
					mobile_number : args.mobileNumber,
					first_name : args.fname || null,
					birth_date : args.dob ? moment(args.dob).format(Alloy.CFG.apiCodes.DATE_FORMAT) : null
				}
			}]
		},
		success : didSendOTP
	});
}

function didSendOTP(result) {
	app.navigator.close();
}

function didClickSignup(e) {
	app.navigator.open({
		ctrl : "fullSignup",
		titleid : "strSignup",
		stack : true,
		ctrlArguments : args
	});
}
