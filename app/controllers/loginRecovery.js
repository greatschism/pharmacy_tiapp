var args = arguments[0] || {},
    app = require("core"),
    utilities = require("utilities"),
    dialog = require("dialog"),
    http = require("requestwrapper");

function didClickSend(e) {
	var email = $.emailTxt.getValue();
	if (utilities.validateEmail(email)) {
		http.request({
			method : "PATIENTS_FORGOT_PASSWORD",
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
		dialog.show({
			message : Alloy.Globals.strings.valEmailRequired
		});
	}
}

function didSuccess(_result) {
	dialog.show({
		message : _result.message,
		success : function() {
			app.navigator.closeToRoot();
		}
	});
}

function didClickCantRemember(e) {
	dialog.show({
		message : Alloy.Globals.strings.msgEmailRecovery,
		buttonNames : [Alloy.Globals.strings.btnGiveUsCall, Alloy.Globals.strings.btnSendUsEmail],
		success : function(_index) {
			if (_index == 0) {
				Ti.Platform.openURL('tel:'+ '6172837737');
			} else {
				var emailDialog = Ti.UI.createEmailDialog();
				emailDialog.subject = "Sample Subject";
				emailDialog.toRecipients = ['foo@yahoo.com'];
				emailDialog.messageBody = '<b>I cannot remember my email address!</b>';
				emailDialog.open();
			}
		}
	});
}