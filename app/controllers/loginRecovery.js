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

	dialog.show({
	message : Alloy.Globals.strings.msgEmailRecovery,
	buttonNames : (isiPhone) ? [Alloy.Globals.strings.btnGiveUsCall, Alloy.Globals.strings.btnSendUsEmail, Alloy.Globals.strings.strCancel] : [Alloy.Globals.strings.btnGiveUsCall, Alloy.Globals.strings.btnSendUsEmail] ,
	success : function(_index) {

		if (_index == 0) {
			Ti.Platform.openURL("tel:" + Alloy.CFG.SUPPORT.call);
		} else if(_index == 1){
			Ti.UI.createEmailDialog({
				subject : Alloy.Globals.strings.strEmailSubjectLoginRecovery,
				messageBody : Alloy.Globals.strings.strEmailBodyLoginRecovery,
				toRecipients : [Alloy.CFG.SUPPORT.email]
			}).open();
		}
	}
});

}