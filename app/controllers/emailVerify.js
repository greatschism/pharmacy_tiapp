var args = arguments[0] || {},
authenticator = require("authenticator");
function focus() {
	$.lblEmail.text = args.email;
}

function init() {
	$.lblWelcome.text = String.format(Alloy.Globals.strings.emailVerifyLblWelcome, Alloy.CFG.client_name);
	$.uihelper.getImage("info", $.imgEmailVerify);
}

function didClickIsntMyEmail() {
	$.app.navigator.open({
		titleid : "titleChangeEmail",
		ctrl : "email",
		ctrlArguments : {
			email : args.email
		},
		stack : true
	});
}

function didClickResendEmail() {
$.http.request({
		method : "email_resend",
		params : {
			feature_code : "THXXX",
			filter : []
		},
		success : didResendEmail,
	});
}

function didResendEmail() {
	authenticator.updatePreferences({
		"email_address" : args.email
	}, {
		success : handleClose
	});
}
function handleClose() {
	$.uihelper.showDialog({
		message : $.strings.emailVerifyMsgResendEmail,
		buttonNames : [$.strings.dialogBtnOK],
		success : function() {
			$.app.navigator.open({
				titleid : "titleHome",
				ctrl : "home",
				stack : false
			});
		}
	});
}

function didClickContinue() {
	$.app.navigator.open({
		titleid : "titleHome",
		ctrl : "home",
		stack : false
	});
}

exports.init = init;
exports.focus = focus;