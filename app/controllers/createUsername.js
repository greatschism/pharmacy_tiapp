var args = arguments[0] || {},
    app = require("core"),
    dialog = require("dialog"),
    uihelper = require("uihelper"),
    utilities = require("utilities"),
    http = require("requestwrapper"),
    encryptionUtil,
    keychainAccount;

function init() {
	$.userLbl.text = String.format(Alloy.Globals.strings.strHi, args.name || "");
	if (OS_IOS || OS_ANDROID) {
		encryptionUtil = require("encryptionUtil");
		keychainAccount = require("com.obscure.keychain").createKeychainItem(Alloy.CFG.USER_ACCOUNT);
	}
}

function moveToNext(e) {
	var nextItem = e.nextItem || false;
	nextItem ? $[nextItem] && $[nextItem].focus() : didClickDone();
}

function didClickEmail() {
	dialog.show({
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
		dialog.show({
			message : Alloy.Globals.strings.valUsernameRequired
		});
		return;
	}
	if (!utilities.validateUserName(uname)) {
		dialog.show({
			message : Alloy.Globals.strings.msgUserNameTips
		});
		return;
	}
	if (!utilities.validateEmail(email)) {
		dialog.show({
			message : Alloy.Globals.strings.valEmailRequired
		});
		return;
	}
	http.request({
		method : "PATIENTS_STORE_TO_APP_CONVERSION",
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
	if (OS_IOS || OS_ANDROID) {
		keychainAccount.reset();
		keychainAccount.account = encryptionUtil.encrypt($.unameTxt.getValue());
	}
	dialog.show({
		title : Alloy.Globals.strings.titleThanks,
		message : Alloy.Globals.strings.msgUsernameCreated,
		success : function() {
			app.navigator.closeToRoot();
		}
	});
}

exports.init = init;
