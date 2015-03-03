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
		keychainAccount = require("com.obscure.keychain").createKeychainItem("account");
	}
}

function moveToNext(e) {
	var nextItem = e.nextItem || false;
	nextItem ? $[nextItem] && $[nextItem].focus() : didClickDone();
}

function didClickEmail() {
	dialog.show({
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
	keychainAccount.account = uname;
	// CALL to MOBILETOEPHARMACYOCNVERT
	//	http.request({
	//		method : "PATIENTS_NEW_PASSWORD",
	//		data : {
	//			data : [{
	//				patient : {
	//					user_name : "",
	//					email_address : "",
	//					password : ""
	//				}
	//			}]
	//		},
	//		success : didClickAgreement
	//	});
	dialog.show({
		message : Alloy.Globals.strings.msgUsernameCreated,
		success : function() {
			app.navigator.closeToRoot();
		}
	});
}

exports.init = init;
