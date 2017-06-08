var args = $.args,
    http = require("requestwrapper"),
    uihelper = require("uihelper"),
    utilities = require("utilities");

function didClickHelp() {
	var url = Alloy.Models.appload.get("help_text_url");
	Ti.Platform.openURL(url);
}

function didClickSend() {
	//	As per requirements in Oxygen-7.1.0 user can enter either email or username 
	var email = $.emailTxt.getValue();
	if (!email) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.userRecoveryValEmail
		});
		return;
	}
	http.request({
		method : "patient_forgotpassword",
		params : {
			data : [{
				forgotPassword : {
					user_name : email
				}
			}]
		},
		success : didSendEmail
	});
}

function didSendEmail() {
	$.uihelper.showDialog({
		message : Alloy.Globals.strings.msgUserRecoverySuccess,
		buttonNames : [$.strings.dialogBtnOK],
		success : function() {
			$.app.navigator.close();
		}
	});
}

function didClickForgotUsername() {
	$.app.navigator.open({
		ctrl : "signup",
		titleid : "titleConfirmAccount",
		stack : true
	});
}

function showForgotUsernameDialog(){
	$.uihelper.showDialog({
		message : $.strings.loginErrCofirmAccount,
		success : didClickForgotUsername
	});
}