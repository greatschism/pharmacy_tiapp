var args = arguments[0] || {},
	app = require("core"),
	didChangeEmailValue = false;

function init() {
	$.emailTxt.setValue(Alloy.Models.patient.get("email_address") || $.strings.strNotAvailable);
	var len = $.emailTxt.getValue().length;
	$.emailTxt.setSelection(0, len);
}

function didChangeEmail(){
	didChangeEmailValue = true;
}

function didClickDone(){
	/**
	 * Requirement: If the user presses “Done” without making any changes, they are simply brought back to the Account screen without any action being taken.
	 */
	if(didChangeEmailValue){
		var email = $.emailTxt.getValue();
		if (!email){
			$.uihelper.showDialog({
				message : Alloy.Globals.strings.registerValEmail
			});
			return;
		}
		if (!$.utilities.validateEmail(email)) {
			$.uihelper.showDialog({
				message : Alloy.Globals.strings.registerValEmailInvalid
			});
			return;
		}
		/**
		 * to do - call API patient/Update
		 */
		$.http.request({
			method : "patient_update",
			params : {
				feature_code : "THXXX",
				data : [{
					patient: {
					 	email : $.emailTxt.getValue()
					 }
				}]
			},
			success : didUpdateEmail
		});
	}
	else{
		app.navigator.close();
	}
}

function didUpdateEmail(){
	Alloy.Models.patient.set("email_address", $.emailTxt.getValue());
	$.uihelper.showDialog({
		message : $.strings.msgAccountEmailVerification,
		buttonNames : [$.strings.dialogBtnOK],
		success : function(){
			app.navigator.close();
		}
	});
}

exports.init = init;
