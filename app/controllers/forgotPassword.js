var args = arguments[0] || {},
	http = require("requestwrapper"),
	uihelper = require("uihelper"),
	utilities = require("utilities");

function didClickForgotEmail(){
	/*to do - not sure about the behaviour: PHA-1047*/
}

function didClickSend(){
	var email = $.emailTxt.getValue();
	if(!email){
		uihelper.showDialog({
			message : Alloy.Globals.strings.registerValEmail
		});
		return;
	}
	if (!utilities.validateEmail(email)) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.registerValEmailInvalid
		});
		return;
	}
	http.request({
		method : "patient_forgotpassword",
		params : {
			feature_code : "THXXX",
			data: [
			        {
			            forgotPassword: {
			                user_name: email
			            }
			        }
				  ]
				 },
		success : didSendEmail
	});
}

function didSendEmail(){
	$.uihelper.showDialog({
		message : Alloy.Globals.strings.msgUserRecoverySuccess,
		buttonNames : [$.strings.dialogBtnOK],
		success : function(){
			$.app.navigator.close();
		}
	});
}
