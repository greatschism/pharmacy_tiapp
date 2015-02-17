var args = arguments[0] || {},
    app = require("core"),
    http = require("requestwrapper"),
    uihelper = require("uihelper");
    
    uihelper.getImage($.logoImage);
 

function didClickContinue(e) {
	var mobileNumber = $.mobileTxt.getValue();

	if (mobileNumber != ""&& mobileNumber.length==10&& isNaN(mobileNumber)==false) {

		

		http.request({
			method : "PATIENTS_MOBILE_EXISTS_OR_SHARED",
			data : {
				
 client_identifier: "x",
 version: "x",
 session_id: "x",
 filter: [{
  type:"mobile_otp"
 }],
 data: [{
  patient: {
   mobile_number:mobileNumber,
   first_name:"x",
   last_name:"x",
   birth_date:"x"
  }
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
	
	
	if (mobileExists==1&&isMobileShared==0) {
		
		app.navigator.open({
				ctrl : "textToApp",
				titleid : "",
				stack : true,
				ctrlArguments : {
			    mobileShared:isMobileShared,
				
			}
			});	

	} 
	else {
		if (isMobileShared == 1 && mobileExists == 1) {
			var mobileNumber = $.mobileTxt.getValue();		
			
				console.log("function working");
				http.request({
					method : "PATIENTS_MOBILE_GENERATE_OTP",
					data : {

						client_identifier : "x",
						version : "x",
						session_id : "x",
						filter : [{
							type : "mobile_otp"
						}],
						data : [{
							patient : {
								mobile_number : mobileNumber,
								first_name : "x",
								last_name : "x",
								birth_date : "x"
							}
						}]
					},
					success : didSuccessOtp,
				});

		}
		else if(mobileExists == 0)
		{
			app.navigator.open({
			ctrl : "fullSignup",
			titleid : "strSignup",
			stack : true,
			ctrlArguments : {
				mobileShared:isMobileShared,
			}
		});
		}
	}
	
		
function didSuccessOtp(result) {
	console.log("otp generated");
	
	console.log(result.data);
	
	} 
			//if it is shared  nav to text to app
			app.navigator.open({
				ctrl : "textToApp",
				titleid : "",
				stack : true,
				ctrlArguments : {
			    mobileShared:isMobileShared,
				
			}
			});
		}

	




			