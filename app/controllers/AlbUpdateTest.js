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
    encryptionUtil = require("encryptionUtil");

function init() {
	/**
	 * Set the right button "show/hide"
	 * with right parameters.
	 */
	if (Alloy.CFG.toggle_password_enabled) {
		setRightButton(rightButtonDict.title, rightButtonDict);
	}

	// $.askInfoLbl.text = Alloy.Globals.strings.loginInfoUpdateAskInfo;
	$.askInfoLbl.text = "We've improved your experience since your last visit! Please note with our new improvements, an email address must be UNIQUE and cannot be shared with another family member. If someone else is a part of your family care team and has used the same email address you typically use, please create a NEW email for your account, or utilize another existing email address.";

	uihelper.getImage("logo", $.logoImg);

	$.emailTxt.tooltip = "Entered email ids do not match";
	$.passwordTxt.tooltip = "Entered passwords do not match";

	$.passwordTooltip.updateArrow($.createStyle({
		classes : ["direction-down"]
	}).direction, $.createStyle({
		classes : ["i5", "inactive-fg-color", "icon-tooltip-arrow-down"]
	}));

	$.emailTooltip.updateArrow($.createStyle({
		classes : ["direction-down"]
	}).direction, $.createStyle({
		classes : ["i5", "inactive-fg-color", "icon-tooltip-arrow-down"]
	}));

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
			message : "Entered email ids do not match"
		});
	} else if (who == "password") {
		uihelper.showDialog({
			message : "Entered passwords do not match"
		});
	}
}

function testOLD(who) {
	if (who == "email") {
		$.emailTooltip.updateArrow($.createStyle({
			classes : ["direction-down"]
		}).direction, $.createStyle({
			classes : ["i5", "inactive-fg-color", "icon-filled-arrow-down"]
		}));

		$.emailTooltip.applyProperties({
			top : $.infoView.rect.y
		});
		if (!Ti.App.accessibilityEnabled) {
			$.emailTooltip.show();
		}
	} else if (who == "password") {
		$.passwordTooltip.updateArrow($.createStyle({
			classes : ["direction-down"]
		}).direction, $.createStyle({
			classes : ["i5", "inactive-fg-color", "icon-filled-arrow-down"]
		}));

		$.passwordTooltip.applyProperties({
			top : $.infoView.rect.y
		});
		if (!Ti.App.accessibilityEnabled) {
			$.passwordTooltip.show();
		}
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
	}

	if (password !== passwordVerify) {
		test("password");
	}

	/*
	 var upgraded_info = {
	 email : email,
	 password : password
	 };

	 var is_auto_login_enabled = utilities.getProperty(Alloy.CFG.auto_login_enabled, false, "bool", false);
	 if (is_auto_login_enabled && email && password) {

	 args.keychain.reset();
	 args.keychain.account = encryptionUtil.encrypt(email);
	 args.keychain.valueData = encryptionUtil.encrypt(password);

	 utilities.setProperty(Alloy.CFG.lastest_logout_explicit, false, "bool", false);

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
	 success : didFailed,
	 failure : didFailed,
	 passthrough : upgraded_info
	 });*/

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

function didFailed() {

}

function didClickHide(e) {
	$.tooltip.hide();
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

function didScrollerEnd(e) {
	$.passwordTooltip.hide();
	$.emailTooltip.hide();
}

function didFocusPassword(e) {
}

function didBlurFocusPassword() {
	$.passwordTooltip.hide();
}

function didFocusEmail(e) {
}

function didBlurFocusEmail() {
	$.emailTooltip.hide();
}

function didClickTooltip(e) {
	e.source.hide();
}

function didPostlayoutTooltip(e) {
	e.source.size = e.size;
	e.source.off("postlayout", didPostlayoutTooltip);
}

exports.init = init;
exports.cancel = didClickCancel;
exports.backButtonHandler = backButtonHandler;
