var args = arguments[0] || {};
function init() {
	$.uihelper.getImage("child_add", $.txtSuccessImg);
$.uihelper.getImage("fail", $.txtFailImg);
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
			"txtCode":false,
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
			"txtNotReceiveTitle":false,
			"txtNotReceiveLbl":false,
			"txtNotReceiveBtn":false,
			"skipTxtNotReceiveAttr":false,
			"txtSuccessImg":false,
			"txtFailImg":true
		},
	});
}

function replyTextMessage() {
	$.app.navigator.open({
		titleid : "titleTextMsgSignUp",
		ctrl : "textMessage",
		stack : true,
		ctrlArguments : {
			"txtCode":true,
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
			"txtNotReceiveTitle":false,
			"txtNotReceiveLbl":false,
			"txtNotReceiveBtn":false,
			"skipTxtNotReceiveAttr":false,
			"txtSuccessImg":false,
			"txtFailImg":true
		},
	});
}

function sendTextSignUpMessage() {
	$.app.navigator.open({
		ctrl : "textMessage",
		stack : true,
		ctrlArguments : {
			"txtCode":true,
			"txtMsgTitle" : true,
			"txtMsgLbl" : true,
			"signUpLbl" : false,
			"signUpTitle" : false,
			"txtHelpTitle" : false,
			"txtHelpLbl" : false,
			"replyTextMsgBtn" : true,
			"sendMeTextAgainSignUpBtn" : false,
			"sendMeTextAgainTextHelpBtn" : false,
			"skipSignUpAttr" : true,
			"skipNoTextMsgAttr" : false,
			"didNotReceiveTextAttr" : false,
			"stillReceiveTextAttr" : false,
			"checkPhoneAttr" : false,
			"txtNotReceiveTitle":false,
			"txtNotReceiveLbl":false,
			"txtNotReceiveBtn":false,
			"skipTxtNotReceiveAttr":false,
			"txtSuccessImg":true,
			"txtFailImg":false
		}
	});
}

function sendTextTextHelpMessage() {
	$.app.navigator.open({
		ctrl : "textMessage",
		stack : true,
		ctrlArguments : {
			"txtCode":true,
			"txtMsgTitle" : true,
			"txtMsgLbl" : true,
			"signUpLbl" : false,
			"signUpTitle" : false,
			"txtHelpTitle" : false,
			"txtHelpLbl" : false,
			"replyTextMsgBtn" : true,
			"sendMeTextAgainSignUpBtn" : false,
			"sendMeTextAgainTextHelpBtn" : false,
			"skipSignUpAttr" : true,
			"skipNoTextMsgAttr" : false,
			"didNotReceiveTextAttr" : false,
			"stillReceiveTextAttr" : false,
			"checkPhoneAttr" : false,
			"txtNotReceiveTitle":false,
			"txtNotReceiveLbl":false,
			"txtNotReceiveBtn":false,
			"skipTxtNotReceiveAttr":false,
			"txtSuccessImg":true,
			"txtFailImg":false
		}
	});
}

function checkPhoneNumberClicked() {
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
			"txtCode":false,
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
			"txtNotReceiveTitle":true,
			"txtNotReceiveLbl":true,
			"txtNotReceiveBtn":true,
			"skipTxtNotReceiveAttr":true,
			"txtSuccessImg":false,
			"txtFailImg":true
		}
	});
}

exports.init = init;
