var args = arguments[0] || {},
    app = require("core"),
    utilities = require("utilities"),
    uihelper = require("uihelper"),
    http = require("requestwrapper");

function didClickSend(e) {
	var email = $.emailTxt.getValue();
	if (utilities.validateEmail(email)) {
		http.request({
			method : "patients_forgot_password",
			data : {
				data : [{
					patient : {
						email_address : email
					}
				}]
			},
			success : didSuccess
		});
	} else {
		uihelper.showDialog({
			message : Alloy.Globals.strings.valEmailRequired
		});
	}
}

function didSuccess(result) {
	uihelper.showDialog({
		message : result.message,
		success : function() {
			//app.navigator.closeToRoot(); --original flow
			app.navigator.open({// -- temporary redirection for demo
				ctrl : "newPassword",
				stack : true
			});
		}
	});
}

function didClickCantRemember(e) {
	var osname = Ti.Platform.osname;
	var isiPhone = (osname == 'iphone') ? true : false;
	uihelper.showDialog({
		message : Alloy.Globals.strings.msgEmailRecovery,
		buttonNames : (isiPhone) ? [Alloy.Globals.strings.btnGiveUsCall, Alloy.Globals.strings.btnSendUsEmail, Alloy.Globals.strings.strCancel] : [Alloy.Globals.strings.btnGiveUsCall, Alloy.Globals.strings.btnSendUsEmail],
		success : function(index) {
			if (index == 0) {
				Ti.Platform.openURL("tel:" + Alloy.CFG.support.call);
			} else if (index == 1) {
				Ti.UI.createEmailDialog({
					subject : Alloy.Globals.strings.strEmailSubjectLoginRecovery,
					messageBody : Alloy.Globals.strings.strEmailBodyLoginRecovery,
					toRecipients : [Alloy.CFG.support.email]
				}).open();
			}
		}
	});

}