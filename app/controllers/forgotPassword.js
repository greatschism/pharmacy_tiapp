var args = $.args,
    http = require("requestwrapper"),
    uihelper = require("uihelper"),
    utilities = require("utilities");

function didClickContactSupport() {
	$.contactSupport = Alloy.createWidget("ti.optiondialog", "widget", $.createStyle({
		options : [Alloy.Globals.strings.dialogBtnPhone, Alloy.Globals.strings.dialogBtnEmail, Alloy.Globals.strings.dialogBtnCancel],
		cancel : 2,
		analyticsId : "ContactSupportOptionDlg"
	}));

	$.contactSupport.on("click", function didClick(evt) {
		if (!evt.cancel) {
			switch(evt.index) {
			case 0:
				var supportPhone = Alloy.Models.appload.get("supportphone");
				uihelper.openDialer(utilities.validatePhoneNumber(supportPhone));
				break;
			case 1:
				var supportEmail = Alloy.Models.appload.get("supportemail_to");
				uihelper.openEmailDialog({
					toRecipients : [supportEmail]
				});
				break;
			}
		}
		$.contactSupport.off("click", didClick);
		$.contactSupport.destroy();
		$.contactSupport = null;
	});
	$.contactSupport.show();
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
