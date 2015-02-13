var args = arguments[0] || {},
    app = require("core"),
    http = require("requestwrapper");
    
    
    
    
		function init(e) {
			console.log("function working");

		http.request({
			method : "PATIENTS_MOBILE_GENERATE_OTP",
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
		
		
function didSuccess(result) {
	console.log("otp generated");
	
	console.log(result.data);
	
	} 
	
    

function didClickContinue(e) {
	
	http.request({
			method : "PATIENTS_VALIDATE",
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
			success : correctOtp,

		});
	}


		
		
function correctOtp(result) {	
	console.log("valid otp");	
	console.log(result.data);
	app.navigator.open({
		ctrl : "sharedMobileCheck",
		titleid : "",
		stack : true
	});
	
	}
	
	
	



function didClickDidntGetText(e) {
	app.navigator.open({
		ctrl : "didntgetText",
		titleid : "titleTextHelp",
		stack : true
	});
}