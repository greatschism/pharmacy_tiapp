var args = arguments[0] || {},
    phone = args.phone;
otp = args.otp;

function init() {
	$.uihelper.getImage("child_add", $.txtSuccessImg);
	$.uihelper.getImage("fail", $.txtFailImg);
	if (args.txtCode === true) {
		$.txtCode.editable=false;
		$.txtCode.setValue(args.otp);
	}

}

function skipClicked() {
	$.app.navigator.open({
		titleid : "titleHome",
		ctrl : "home",
		stack : false
	});
}

function didNotReceiveClicked() {
	$.app.navigator.open({
		titleid : "titleTextHelp",
		ctrl : "textMessage",
		stack : true,
		ctrlArguments : {
			"phone" : phone,
			"otp" : otp,
			"txtCode" : false,
			"txtMsgTitle" : false,
			"txtMsgLbl" : false,
			"signUpLbl" : false,
			"signUpTitle" : false,
			"txtHelpTitle" : true,
			"txtHelpLbl" : true,
			"replyTextMsgBtn" : false,
			"sendMeTextAgainSignUpBtn" : false,
			"sendMeTextAgainTextHelpBtn" : true,
			"skipNoTextMsgAttr" : true,
			"didNotReceiveTextAttr" : false,
			"stillReceiveTextAttr" : true,
			"checkPhoneAttr" : true,
			"txtNotReceiveTitle" : false,
			"txtNotReceiveLbl" : false,
			"txtNotReceiveBtn" : false,
			"skipTxtNotReceiveAttr" : false,
			"txtSuccessImg" : false,
			"txtFailImg" : true
		},
	});
}

function replyTextMessage() {
	$.http.request({
		method : "patient_get",
		params : {
			feature_code : "THXXX"
		},
		success : didGetPatient,
		failure : didFailPatient
	});
}

function didReplied() {
	Alloy.Models.patient.set("mobile_number", $.utilities.formatPhoneNumber(phone));
	$.utilities.setProperty(Alloy.CFG.latest_phone_verified, $.utilities.formatPhoneNumber(phone));
	$.app.navigator.open({
		titleid : "titleHome",
		ctrl : "home",
		stack : false
	});
}

function didFailPatient() {
$.app.navigator.open({
			titleid : "titleTextMsgSignUp",
			ctrl : "textMessage",
			stack : true,
			ctrlArguments : {
				"phone" : phone,
				"otp" : otp,
				"txtCode" : true,
				"txtMsgTitle" : false,
				"txtMsgLbl" : false,
				"signUpLbl" : true,
				"signUpTitle" : true,
				"txtHelpTitle" : false,
				"txtHelpLbl" : false,
				"replyTextMsgBtn" : true,
				"sendMeTextAgainSignUpBtn" : true,
				"sendMeTextAgainTextHelpBtn" : false,
				"skipSignUpAttr" : true,
				"skipNoTextMsgAttr" : false,
				"didNotReceiveTextAttr" : false,
				"stillReceiveTextAttr" : false,
				"checkPhoneAttr" : false,
				"txtNotReceiveTitle" : false,
				"txtNotReceiveLbl" : false,
				"txtNotReceiveBtn" : false,
				"skipTxtNotReceiveAttr" : false,
				"txtSuccessImg" : false,
				"txtFailImg" : true
			},
		});
}

function didGetPatient(result) {
	var verified = result.data.patients.is_mobile_verified;
	if (parseInt(verified)) {
		$.uihelper.showDialog({
			message : Alloy.Globals.strings.textMessageMobileVerified,
			success : didReplied
		});
	} else {
		$.app.navigator.open({
			titleid : "titleTextMsgSignUp",
			ctrl : "textMessage",
			stack : true,
			ctrlArguments : {
				"phone" : phone,
				"otp" : otp,
				"txtCode" : true,
				"txtMsgTitle" : false,
				"txtMsgLbl" : false,
				"signUpLbl" : true,
				"signUpTitle" : true,
				"txtHelpTitle" : false,
				"txtHelpLbl" : false,
				"replyTextMsgBtn" : true,
				"sendMeTextAgainSignUpBtn" : true,
				"sendMeTextAgainTextHelpBtn" : false,
				"skipSignUpAttr" : true,
				"skipNoTextMsgAttr" : false,
				"didNotReceiveTextAttr" : false,
				"stillReceiveTextAttr" : false,
				"checkPhoneAttr" : false,
				"txtNotReceiveTitle" : false,
				"txtNotReceiveLbl" : false,
				"txtNotReceiveBtn" : false,
				"skipTxtNotReceiveAttr" : false,
				"txtSuccessImg" : false,
				"txtFailImg" : true
			},
		});
	}
}


function sendTextSignUpMessage() {
	$.app.navigator.open({
		ctrl : "textMessage",
		stack : true,
		ctrlArguments : {
			"phone" : phone,
			"otp" : otp,
			"txtCode" : true,
			"txtMsgTitle" : true,
			"txtMsgLbl" : true,
			"signUpLbl" : false,
			"signUpTitle" : false,
			"txtHelpTitle" : false,
			"txtHelpLbl" : false,
			"replyTextMsgBtn" : true,
			"sendMeTextAgainSignUpBtn" : false,
			"sendMeTextAgainTextHelpBtn" : false,
			"skipSignUpAttr" : false,
			"skipNoTextMsgAttr" : false,
			"didNotReceiveTextAttr" : true,
			"stillReceiveTextAttr" : false,
			"checkPhoneAttr" : false,
			"txtNotReceiveTitle" : false,
			"txtNotReceiveLbl" : false,
			"txtNotReceiveBtn" : false,
			"skipTxtNotReceiveAttr" : false,
			"txtSuccessImg" : true,
			"txtFailImg" : false
		}
	});
}

function sendTextTextHelpMessage() {
	$.http.request({
		method : "mobile_add",
		params : {
			feature_code : "THXXX",
			data : [{
				add : {
					mobile : "1" + phone,
					old_mobile : ""
				}
			}]

		},
		success : didSendTextAgain,
		failure : didFail
	});

}

function didFail() {
}

function didSendTextAgain() {
	$.app.navigator.open({
		ctrl : "textMessage",
		stack : true,
		ctrlArguments : {
			"phone" : phone,
			"otp" : otp,
			"txtCode" : true,
			"txtMsgTitle" : true,
			"txtMsgLbl" : true,
			"signUpLbl" : false,
			"signUpTitle" : false,
			"txtHelpTitle" : false,
			"txtHelpLbl" : false,
			"replyTextMsgBtn" : true,
			"sendMeTextAgainSignUpBtn" : false,
			"sendMeTextAgainTextHelpBtn" : false,
			"skipSignUpAttr" : false,
			"skipNoTextMsgAttr" : false,
			"didNotReceiveTextAttr" : true,
			"stillReceiveTextAttr" : false,
			"checkPhoneAttr" : false,
			"txtNotReceiveTitle" : false,
			"txtNotReceiveLbl" : false,
			"txtNotReceiveBtn" : false,
			"skipTxtNotReceiveAttr" : false,
			"txtSuccessImg" : true,
			"txtFailImg" : false
		}
	});
}

function checkPhoneNumberClicked() {
	$.utilities.setProperty(Alloy.CFG.latest_phone_verified, $.utilities.formatPhoneNumber(phone));
	$.app.navigator.open({
		titleid : "titleChangePhone",
		ctrl : "phone",
		stack : true
	});
}

function stillNotReceivingText() {
	$.app.navigator.open({
		titleid : "titleTextHelp",
		ctrl : "textMessage",
		stack : true,
		ctrlArguments : {
			"phone" : phone,
			"otp" : otp,
			"txtCode" : false,
			"txtMsgTitle" : false,
			"txtMsgLbl" : false,
			"signUpLbl" : false,
			"signUpTitle" : false,
			"txtHelpTitle" : false,
			"txtHelpLbl" : false,
			"replyTextMsgBtn" : false,
			"sendMeTextAgainSignUpBtn" : false,
			"sendMeTextAgainTextHelpBtn" : false,
			"skipSignUpAttr" : false,
			"skipNoTextMsgAttr" : false,
			"didNotReceiveTextAttr" : false,
			"stillReceiveTextAttr" : false,
			"checkPhoneAttr" : false,
			"txtNotReceiveTitle" : true,
			"txtNotReceiveLbl" : true,
			"txtNotReceiveBtn" : true,
			"skipTxtNotReceiveAttr" : true,
			"txtSuccessImg" : false,
			"txtFailImg" : true
		}
	});
}

exports.init = init;
