var args = arguments[0] || {},
    app = require("core"),
    http = require("requestwrapper");
    
   
function didClickContinue(e) {
	var otpEntered = $.codeTxt.getValue();
	
	http.request({
			method : "PATIENTS_VALIDATE",
			data : {
				

 client_identifier: "x",
 version: "x",
 session_id: "x",
 filter: [{
 type:"mobile_otp"
 }],
 "data": [{
  "patient": {
   "mobile_number":"x",
   "first_name":"x",
   "last_name":"x",
   "birth_date":"x",
   "token":otpEntered
  }
 }]

},

success : correctOtp,

		});
	}


		
		
function correctOtp(result) {	
	console.log("valid otp");	
	console.log(result.data);
	if(args.mobileShared==1){
	app.navigator.open({
		ctrl : "sharedMobileCheck",
		titleid : "",
		stack : true
	});
	
	}
	
	else if(args.mobileShared==0){
			app.navigator.open({
			ctrl : "signup",
			titleid : "",			
			stack : true
		});
		
	
	}
}
	
	
	



function didClickDidntGetText(e) {
	app.navigator.open({
		ctrl : "didntgetText",
		titleid : "titleTextHelp",
		stack : true
	});
}