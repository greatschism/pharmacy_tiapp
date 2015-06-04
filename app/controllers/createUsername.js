var args = arguments[0] || {},
    app = require("core"),
    uihelper = require("uihelper"),
    utilities = require("utilities"),
    http = require("requestwrapper"),
    encryptionUtil = require("encryptionUtil"),
    keychainAccount = require("com.obscure.keychain").createKeychainItem(Alloy.CFG.user_account);

function init() {
	$.userLbl.text = String.format(Alloy.Globals.strings.strHi, args.name || "");
}

function moveToNext(e) {
	var nextItem = e.nextItem || false;
	nextItem ? $[nextItem] && $[nextItem].focus() : didClickDone();
}

function didClickEmail() {
	uihelper.showDialog({
		title : Alloy.Globals.strings.titleEmailAddress,
		message : Alloy.Globals.strings.msgWhyEmailAddress
	});
}

function didClickAgreement(e) {
	app.navigator.open({
		ctrl : "termsAndConditions",
		titleid : "titleTermsAndConditions",
		stack : "true"
	});
}

function didClickDone(e) {
	var email = $.emailTxt.getValue();
	var uname = $.unameTxt.getValue();
	if (!uname) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.valUsernameRequired
		});
		return;
	}
	if (!utilities.validateUserName(uname)) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.msgUserNameTips
		});
		return;
	}
	if (!utilities.validateEmail(email)) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.valEmailRequired
		});
		return;
	}
	http.request({
		method : "patients_store_to_app_conversion",
		data : {
			filter : [{
				type : "mobile_otp"
			}],
			data : [{
				patient : {
					user_name : uname,
					email_address : email,
					password : args.password
				}
			}]
		},
		success : didCreateUsername
	});
}

function didCreateUsername() {
	keychainAccount.reset();
	keychainAccount.account = encryptionUtil.encrypt($.unameTxt.getValue());
	uihelper.showDialog({
		title : Alloy.Globals.strings.titleThanks,
		message : Alloy.Globals.strings.msgUsernameCreated,
		success : function() {
			app.navigator.closeToRoot();
		}
	});
}

exports.init = init;
