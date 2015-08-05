var args = arguments[0] || {},
	app = require("core"),
	didChangeEmail = false;

function init() {
	$.emailTxt.setValue(Alloy.Models.patient.get("email_address") || $.strings.strNotAvailable);
	var len = $.emailTxt.getValue().length;
	$.emailTxt.setSelection(0, len);
}

function didChangeEmail(){
	didChangeEmail = true;
}

function didClickDone(){
	/**
	 * Requirement: If the user presses “Done” without making any changes, they are simply brought back to the Account screen without any action being taken.
	 */
	if(didChangeEmail){
		/**
		 * to do - call API patient/Update
		 */
		$.http.request({
			method : "patient_email_update",
			params : {
				feature_code : "THXXX",
				data : [{
					patient: {
					 	email_address : $.emailTxt.getValue()
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
	$.uihelper.showDialog({
		message : $.strings.msgAccountEmailVerification,
		buttonNames : [$.strings.dialogBtnOK],
		success : function(){
			app.navigator.close();
		}
	});
}

exports.init = init;