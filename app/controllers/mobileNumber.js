var args = arguments[0] || {},
    app = require("core"),
    http = require("requestwrapper");

function didClickContinue(e) {

	// app.navigator.open({
	// ctrl : "fullSignup",
	// titleid: "strSignup",
	// stack : true
	// });

	http.request({
		method : "PATIENTS_MOBILE_EXISTS_OR_SHARED", // This value is defined in config.json
		forceRetry : false,
		data : {
			data : {
				patient : "",
				mobile_number : "x"
			}
		},
		success : didGetResponse
	});

}

function didGetResponse(result) {
	var mobileNumber = $.mobileTxt.getValue();

	var isMobileShared = result.data.is_mobile_shared,
	    mobileExists = result.data.mobile_exists;
	if (mobileExists !== 1) {
		app.navigator.open({
			ctrl : "fullSignup",
			titleid : "strSignup",
			stack : true,
			ctrlArguments : {
				firstName : mobileExists,
				dateOfBirth : ""
			}
		});
	} else {
		if (isMobileShared !== 1) {

			// http.request({
			// method : "PATIENTS_MOBILE_EXISTS_OR_SHARED", // This value is defined in config.json
			// forceRetry : false,
			// data : {
			// data : {
			// patient : "",
			// mobile_number : mobileNumber
			// }
			// },
			// success : didGetResponse
			// });
			app.navigator.open({
				ctrl : "mobileEnterOTP",
				titleid : "",
				stack : true,
				ctrlArguments : {
					firstName : "",
					dateOfBirth : "",
					mobileNumber : mobileNumber
				}
			});
		} else {
			app.navigator.open({
				ctrl : "sharedMobileCheck",
				titleid : "titleSharedMobileNumber",
				stack : true,
				ctrlArguments : {
					mobileNumber : mobileNumber
				}
			});
		}
	}
}