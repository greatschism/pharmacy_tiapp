var args = $.args,
    moment = require("alloy/moment"),
    apiCodes = Alloy.CFG.apiCodes,
    rightButtonDict = $.createStyle({
	classes : ["txt-positive-right-btn", "positive-fg-color"],
	title : Alloy.Globals.strings.strShow,
	width : "25%",
	backgroundColor : 'transparent'
}),
    utilities = require('utilities'),
    keychain = require("com.obscure.keychain").createKeychainItem(Alloy.CFG.user_account),
    uihelper = require("uihelper"),
    http = require("requestwrapper"),
    app = require("core"),
    encryptionUtil = require("encryptionUtil"),
    logger = require("logger");

function init() {
	/**
	 * Set the right button "show/hide"
	 * with right parameters.
	 */
	if (Alloy.CFG.toggle_password_enabled) {
		setRightButton(rightButtonDict.title, rightButtonDict);
	}

	$.askInfoLbl.html = Alloy.Globals.strings.loginInfoUpdateAskInfoUpdatedText;

	uihelper.getImage("logo", $.logoImg);
}

function didChangeToggle() {
	if (Alloy.CFG.toggle_password_enabled) {
		if ($.passwordTxt.getPasswordMask()) {
			$.passwordTxt.setPasswordMask(false);
			_.extend(rightButtonDict, {
				title : Alloy.Globals.strings.strHide,
				accessibilityLabel : Alloy.Globals.strings.accessibilityStrShowing,
				width : "25%",
				backgroundColor : 'transparent'
			});
		} else {
			$.passwordTxt.setPasswordMask(true);
			_.extend(rightButtonDict, {
				title : Alloy.Globals.strings.strShow,
				accessibilityLabel : Alloy.Globals.strings.accessibilityStrHiding,
				width : "25%",
				backgroundColor : 'transparent'
			});
		}
		setRightButton(rightButtonDict.title, rightButtonDict);
		setTimeout(updatePasswordToggle, 2000);
	}
}

function updatePasswordToggle() {
	if ($.passwordTxt.getPasswordMask()) {
		rightButtonDict.accessibilityLabel = Alloy.Globals.strings.accessibilityStrShow;
	} else {
		rightButtonDict.accessibilityLabel = Alloy.Globals.strings.accessibilityStrHide;
	}
	setRightButton(rightButtonDict.title, rightButtonDict);
}

function setRightButton(iconText, iconDict) {
	$.passwordTxt.setButton(iconText, "right", iconDict);
}

function moveToNext(e) {
	var nextItem = e.nextItem || false;
	if (nextItem && $[nextItem]) {
		$[nextItem].focus();
	}
}

function test(who) {

	if (who == "email") {

		uihelper.showDialog({
			message : "The email IDs entered do not match"
		});
	} else if (who == "password") {
		uihelper.showDialog({
			message : "The passwords entered do not match"
		});
	}
}

function didClickContinue(e) {

	var email = $.emailTxt.getValue(),
	    password = $.passwordTxt.getValue(),
	    emailVerify = $.emailVerifyTxt.getValue(),
	    passwordVerify = $.passwordVerifyTxt.getValue();

	if (!email || !emailVerify) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.loginValUsername
		});
		return;
	}
	if (!utilities.validateEmail(email)) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.loginInfoUpdateValEmailInvalid
		});
		return;
	}
	if (!utilities.validateEmail(emailVerify)) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.loginInfoUpdateValEmailInvalid
		});
		return;
	}
	if (!password || !passwordVerify) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.loginValPassword
		});
		return;
	}

	if (email !== emailVerify) {
		test("email");

		return;
	}

	if (password !== passwordVerify) {
		test("password");
		return;
	}

	var upgraded_info = {
		email : email,
		password : password
	};

	var is_auto_login_enabled = utilities.getProperty(Alloy.CFG.auto_login_enabled, false, "bool", false);
	if (is_auto_login_enabled && email && password) {
		/**
		 * store username and password
		 * on keychain
		 */
		args.keychain.reset();
		args.keychain.account = encryptionUtil.encrypt(email);
		args.keychain.valueData = encryptionUtil.encrypt(password);
		/**
		 * reset lastest_logout_explicit
		 * reset the last value here
		 */
		utilities.setProperty(Alloy.CFG.lastest_logout_explicit, false, "bool", false);
		/**
		 * errorDialogEnabled is enabled
		 * when this is a explicit login
		 * usually happens from login screen
		 * when passthrough has a valid username
		 * and password properties
		 */
		upgraded_info.errorDialogEnabled = true;
	}

	http.request({
		method : "patient_upgrade_account",
		params : {
			data : [{
				patient : {
					"disp_password" : password,
					"email_address" : email
				}
			}]
		},
		success : didSuccess,
		failure : didFailed,
		passthrough : upgraded_info,
		errorDialogEnabled : false
	});

}

function handleClose() {

}

function didSuccess(result, passthrough) {
	Alloy.Globals.isAccountUpgraded = true;
	utilities.setProperty("familyMemberAddPrescFlow", false, "bool", true);
	uihelper.showDialog({
		message : result.message,
		buttonNames : [Alloy.Globals.strings.dialogBtnOK],
		cancelIndex : -1,
		success : function didOk() {
			args.callBack = didInitWin;
			args.checkCodeValues(args);
		}
	});
}

function didFailed(error, passthrough) {
	logger.debug("\n\n\ncame into error		", JSON.stringify(error, null, 4), "\n\n\n");
	if (error.errorCode == "ECOH668") {
		uihelper.showDialog({
			message : "This email address cannot be used; it is already in use with another member’s account. Please use a different email address to complete the upgrade process and sync your account.",
			buttonNames : [Alloy.Globals.strings.dialogBtnOK],
			success : handleClose
		});
	} else {
		$.uihelper.showDialog({
			message : error.message,
		});
	}
}

function didClickCancel() {
	args.keychain.reset();
	didInitWin();
}

function didInitWin(passthrough) {
	app.navigator.hideLoader();
	if (!Alloy.Globals.isAccountUpgraded) {
		app.navigator.open({
			ctrl : "login",
			titleid : "titleLogin"
		});
	};
}

function backButtonHandler(e) {
	app.navigator.showLoader();
	didClickCancel(e);
}

function didClickWhatsNew(e) {
	app.navigator.open({
		ctrl : "vSixCarousel",
		titleid : "vSixCarouselTitle",
		stack : true,
	});
}

exports.init = init;
exports.cancel = didClickCancel;
exports.backButtonHandler = backButtonHandler;
