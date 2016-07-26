var args = $.args,
    authenticator = require("authenticator"),
    moment = require("alloy/moment"),
    apiCodes = Alloy.CFG.apiCodes,
    rightButtonDict = $.createStyle({
	classes : ["txt-positive-right-btn","positive-fg-color"],
	title : Alloy.Globals.strings.strShow,
	width: "25%",
	backgroundColor: 'transparent'
}),
    utilities = require('utilities');

function init() {
	/**
	 * Set the right button "show/hide"
	 * with right parameters.
	 */
	if (Alloy.CFG.toggle_password_enabled) {
		setRightButton(rightButtonDict.title, rightButtonDict);
	}

	$.titleLbl.text = String.format($.strings.loginLblTitle, $.strings.strClientName);
	$.uihelper.getImage("logo", $.logoImg);

	/**
	 * if auto login is enabled
	 * then auto populate the username and password
	 * behaviour can be controlled from theme flags
	 */
	if (authenticator.getAutoLoginEnabled()) {
		var data = authenticator.getData();
		$.usernameTxt.setValue(data.username);
		$.passwordTxt.setValue(data.password);
		$.autoLoginSwt.setValue(true);
	}

	/**
	 * after successful registration,
	 * auto populate username and password
	 */
	/**
	 * todo - show tooltip as per the requirement
	 */
	if (args.username && args.password) {
		$.usernameTxt.setValue(args.username);
		$.passwordTxt.setValue(args.password);
		$.autoLoginSwt.setValue(false);
	}
	var iDict = {};
	if (OS_ANDROID) {
		iDict.accessibilityLabelOn = $.strings.accessibilityLblRememberUsernameToggle;
		iDict.accessibilityLabelOff = $.strings.accessibilityLblRememberUsernameToggle;
    } else {
		iDict.accessibilityLabel = $.strings.accessibilityLblRememberUsernameToggle;
    }
	$.autoLoginSwt.applyProperties(iDict);


	iDict.accessibilityLabel = "password field";
	$.passwordTxt.applyProperties(iDict);

	iDict.accessibilityLabel = "email address field";
	$.usernameTxt.applyProperties(iDict);

}

function didClickAbout() {
	var version = String.format($.strings.loginVersionLbl, Ti.App.version);
	var buildNumber = String.format($.strings.loginBuildNumber, Alloy.CFG.buildNumber);
	var buildDate = String.format($.strings.loginBuildDate, Alloy.CFG.buildDate);
	var copyrightYearHelper = new Date(Date.parse(buildDate)); 
	var copyrightYearHelperString = $.strings.strClientName + ", " + copyrightYearHelper.getFullYear()
	var copyright = String.format($.strings.loginCopyright, copyrightYearHelperString);


	$.uihelper.showDialog({
	    message: version + "\n" + buildNumber + "\n" + buildDate + "\n" + copyright
	});

}

function didChangeToggle() {
	if (Alloy.CFG.toggle_password_enabled) {
		if ($.passwordTxt.getPasswordMask()) {
			$.passwordTxt.setPasswordMask(false);
			_.extend(rightButtonDict, {
				title : $.strings.strHide,
				width: "25%",
				backgroundColor: 'transparent'
			});
		} else {
			$.passwordTxt.setPasswordMask(true);
			_.extend(rightButtonDict, {
				title : $.strings.strShow,
				width: "25%",
				backgroundColor: 'transparent'
			});
		}
		setRightButton(rightButtonDict.title, rightButtonDict);
	}
}

function setRightButton(iconText, iconDict) {
	$.passwordTxt.setButton(iconText, "right", iconDict);
}

function didChangeAutoLogin(e) {
	if (Alloy.CFG.auto_login_dialog_enabled && e.value) {
		$.uihelper.showDialog({
			message : $.strings.msgAutoLogin
		});
	}
}

function moveToNext(e) {
	var nextItem = e.nextItem || false;
	if (nextItem && $[nextItem]) {
		$[nextItem].focus();
	}
}

function didClickLogin(e) {
	var username = $.usernameTxt.getValue(),
	    password = $.passwordTxt.getValue();
	if (!username) {
		$.uihelper.showDialog({
			message : $.strings.loginValUsername
		});
		return;
	}
	if (!password) {
		$.uihelper.showDialog({
			message : $.strings.loginValPassword
		});
		return;
	}
	if ($.utilities.isPhoneNumber(username)) {
		//yet to handle
	} else {
		authenticator.setAutoLoginEnabled($.autoLoginSwt.getValue());
		authenticator.init({
			username : username,
			password : password,
			success : didAuthenticate
		});
	}
}

function didAuthenticate() {
	/**
	 * If the login screen's origin is
	 * from Transfer Rx user details page,
	 * set it to true, if not false.
	 */
	if (args.origin == "transferUserDetails") {
		transferUserDetails = true;
	} else {
		transferUserDetails = false;
	}
	/**
	 * Verify email address
	 * if user has not verified it within 24rs
	 * after registration taking him to email verification
	 * screen upon every login
	 */
	var mPatient = Alloy.Collections.patients.at(0);
	/**
	 * First time login flow takes the uesr to HIPAA screen
	 */
	if (utilities.getProperty($.usernameTxt.getValue(), null, "string", true) == "showHIPAA") {
		$.app.navigator.open({
			ctrl : "hipaa",
			titleid : "titleHIPAAauthorization",
			stack : false
		});
	}
	/**
	 * Check if the partial account has been created.
	 * if so, take the user to log in screen.
	 */
	else if (args.is_adult_partial && args.username === mPatient.get("email_address")) {
		if (args.parent === "registerChildInfo") {
			$.app.navigator.open({
				titleid : "titleChildAdd",
				ctrl : "childAdd",
				ctrlArguments : {
					username : args.username,
					password : args.password,
					isFamilyMemberFlow : false
				},
				stack : false
			});
	} else {
			$.app.navigator.open({
				titleid : "titleAddAnAdult",
				ctrl : "addAnotherAdult",
				stack : false
			});
		}
	} else if (mPatient.get("is_email_verified") !== "1" && moment.utc().diff(moment.utc(mPatient.get("created_at"), Alloy.CFG.apiCodes.ymd_date_time_format), "days", true) > 1) {
		$.app.navigator.open({
			ctrl : "emailVerify",
			ctrlArguments : {
				email : mPatient.get("email_address"),
				transferUserDetails : transferUserDetails,
				navigation : {
					titleid : "titleTransferStore",
					ctrl : "stores",
					ctrlArguments : {
						navigation : {
							titleid : "titleTransferOptions",
							ctrl : "transferOptions",
							ctrlArguments : {
								prescription : transferUserDetails ? args.navigation.ctrlArguments.navigation.ctrlArguments.prescription : {},
								store : {}
							},
							stack : true
						},
						selectable : true
					}
				}
			},
			stack : false
		});
	} else {
		$.app.navigator.open(args.navigation || Alloy.Collections.menuItems.findWhere({
			landing_page : true
		}).toJSON());
	}
}

function didClickForgotPassword(e) {
	$.app.navigator.open({
		ctrl : "forgotPassword",
		titleid : "titleForgotPassword",
		stack : true
	});
}

function didClickSignup(e) {
	$.app.navigator.open({
		ctrl : "register",
		stack : true
	});
}

function didPostlayout(e) {
	/**
	 * we need height of
	 * $.autoLoginLbl so waiting for postlayout
	 * Note: event listener should be removed
	 * to avoid redundant event calls
	 */
	$.autoLoginLbl.removeEventListener("postlayout", didPostlayout);
	/**
	 * apply properties for the tooltip
	 *
	 */

		$.tooltip.updateArrow($.createStyle({
			classes : ["direction-up"]
		}).direction, $.createStyle({
			classes : ["i5", "primary-fg-color", "icon-filled-arrow-up","right"]
		}));

	$.tooltip.applyProperties($.createStyle({
		top : $.autoLoginView.rect.y + $.autoLoginView.rect.height,
		width : "90%"
	}));

	/**
	 * tool tip will be shown
	 * only when the username/password is prepopulated.
	 * As in full account (register.js) and partial account(mgrAccountCreation.js) registration scenarios
	 */
	if (args.is_adult_partial || utilities.getProperty($.usernameTxt.getValue(), null, "string", true) == "showHIPAA") {
		$.tooltip.show();
	}

}

function didClickHide(e) {
	$.tooltip.hide();
}

exports.init = init;
