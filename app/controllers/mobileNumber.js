var args = arguments[0] || {},
    app = require("core"),
    http = require("requestwrapper");
 

function didClickContinue(e) {
	var mobileNumber = $.mobileTxt.getValue();

	if (mobileNumber != ""&& mobileNumber.length==10&& isNaN(mobileNumber)==false) {

		

		http.request({
			method : "PATIENTS_MOBILE_EXISTS_OR_SHARED",
			data : {
				client_identifier : "x",
				version : "x",
				session_id : "x",
				filter : null,
				lang : "en",
				data : [{
					appload : [{
						phone_model : "x",
						phone_os : "x",
						phone_platform : "x",
						device_id : "x",
						carrier : "x",
						app_version : "x",
						client_name : "x",
						client_param_type : "menu",
						client_param_version : "x",
						client_param_base_version : "x"
						
					}]
				}]
			},
			success : didSuccess,

		});
	}
	else{
		alert("Please enter a valid 10 digit mobile number");
	}
}

		
		
function didSuccess(result) {
	console.log("entered didgetresponse");
	var isMobileShared = result.data.is_mobile_shared;
	console.log(result.data);
	var Exists = result.data.patients;
	var mobileExists = result.data.patients.mobile_exists;
	var isMobileShared=result.data.patients.is_mobile_shared;
	if (mobileExists==0) {
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
		if (isMobileShared == 1 && mobileExists==1) {
			//if it is shared  nav to text to app
			app.navigator.open({
				ctrl : "textToApp",
				titleid : "",
				stack : true
			});

		}

	}
}



			