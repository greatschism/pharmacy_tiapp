var args = $.args,
    authenticator = require("authenticator"),
    moment = require("alloy/moment"),
    apiCodes = Alloy.CFG.apiCodes,
    isInitializing = false,
    rightButtonDict = $.createStyle({
		classes : ["txt-positive-right-btn", "positive-fg-color"],
		title : Alloy.Globals.strings.strShow,
		accessibilityLabel : Alloy.Globals.strings.accessibilityStrShow,
		width : "25%",
		backgroundColor : 'transparent'
	}),
    utilities = require('utilities');

	var touchID = require("touchid");


function init() {
	/**
	 * Set the right button "show/hide"
	 * with right parameters.
	 */
	isInitializing = true;
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


	if (authenticator.getTouchIDEnabled()) {

		Ti.API.info("args are + " + JSON.stringify(args));

		//$.touchIDLoginSwt.setValue(true);

		if(args.requires_login_auth === true) {

			$.app.navigator.showLoader();
		
		 	var result = touchID.deviceCanAuthenticate();
		 
		 	var passcodeAuthProcess = function () {

		 		touchID.authenticate(function(tIDResp) {
					Ti.API.info("no error in TID.  resp = " + JSON.stringify(tIDResp));
		 			setTimeout( function(){

							touchIDAuth({"success":true}); 
		 				},0);

					}, function(tIDResp) {
		 					Ti.API.info("error in TID.  resp = " + JSON.stringify(tIDResp));
			 				setTimeout( function(){

								$.app.navigator.hideLoader();
			 				},0);
					}
			 	);
		 	};

		 
		 	if (!result) { //(!result.canAuthenticate) {
		 	//	alert('Touch ID Message: ' + result.error + '\nCode: ' + result.code);
		 	///  Add some kind of 'please turn off touchid error message here....'
				$.app.navigator.hideLoader();
		 	} else {
		 		//alert("about to touchID auth "+JSON.stringify(itemObj));
		 		passcodeAuthProcess();
		 	}
		 	
			return;

		}

		if(args.useTouchID === true) {

			if(authenticator.getTouchIDEnabled()) {

				touchIDAuth({"success":true}); 
				return;
			} 
		} else {
			
		}
	}

	var iDict = {};
	if (OS_ANDROID) {
		iDict.accessibilityLabelOn = $.strings.accessibilityLblRememberUsernameToggle;
		iDict.accessibilityLabelOff = $.strings.accessibilityLblRememberUsernameToggle;
	} else {
		iDict.accessibilityLabel = $.strings.accessibilityLblRememberUsernameToggle;
	}
	$.autoLoginSwt.applyProperties(iDict);

	if (OS_IOS) {
		var sDict = {};
		sDict.accessibilityValue = $.strings.loginAttrLabelsAccessibilityHint;
		$.forgotPwdAttr.applyProperties(sDict);
		$.signupAttr.applyProperties(sDict);
		$.aboutAttr.accessibilityValue = $.strings.loginAttrLabelsAccessibilityHint;
	};
}

function touchIDAuth(resp)  {
 	Ti.API.info("in touchIDAuth "+ JSON.stringify(resp));
		
	var data = authenticator.forceGetData();
	var username = data.username;
	var password = data.password;

	if(resp.success == true) {
			setTimeout(authenticator.init({
				username : username,
				password : password,
				success : function() {
					setTimeout( didAuthenticate , 0);
				},
				failure : function() {
					Ti.API.info("big authentcate fail");
				}
			}) , 0);

	} else {
		alert("Please login manually.");
	}
}



function didClickAbout() {
	var version = String.format($.strings.loginVersionLbl, Ti.App.version);
	var buildNumber = String.format($.strings.loginBuildNumber, Alloy.CFG.buildNumber);
	var buildDate = String.format($.strings.loginBuildDate, Alloy.CFG.buildDate);
	var copyrightYearHelper = new Date(Date.parse(buildDate));
	var copyrightYearHelperString = $.strings.strClientName + ", " + copyrightYearHelper.getFullYear();
	var copyright = String.format($.strings.loginCopyright, copyrightYearHelperString);

	$.uihelper.showDialogWithButton({
		message : version + "\n" + buildNumber + "\n" + buildDate + "\n" + copyright,
		btnOptions : [{
			title : $.strings.loginAgreementTOS,
			onClick : showTOS
		}, {
			title : $.strings.loginAgreementPrivacy,
			onClick : showPrivacy
		}]
	});

}

function showTOS() {
	var url = Alloy.Models.appload.get("tos_url");
	$.app.navigator.open({
		ctrl : "termsDoc",
		title : $.strings.loginAgreementTOS,
		stack : true,
		ctrlArguments : {
			terms : url,
			registrationFlow : true
		}
	});
}

function showPrivacy() {
	var url = Alloy.Models.appload.get("privacy_policy_url");
	$.app.navigator.open({
		ctrl : "termsDoc",
		title : $.strings.loginAgreementPrivacy,
		stack : true,
		ctrlArguments : {
			terms : url,
			registrationFlow : true
		}
	});
}

function didChangeToggle() {
	if (Alloy.CFG.toggle_password_enabled) {
		if ($.passwordTxt.getPasswordMask()) {
			$.passwordTxt.setPasswordMask(false);
			_.extend(rightButtonDict, {
				title : $.strings.strHide,
				accessibilityLabel : Alloy.Globals.strings.accessibilityStrShowing,
				width : "25%",
				backgroundColor : 'transparent'
			});
		} else {
			$.passwordTxt.setPasswordMask(true);
			_.extend(rightButtonDict, {
				title : $.strings.strShow,
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



		// if( !utilities.getProperty(Alloy.CFG.touchid_prompted, false, "bool", false) && touchID.deviceCanAuthenticate() ) {
		// 	utilities.setProperty(Alloy.CFG.touchid_prompted, true, "bool", false);
		// 	$.uihelper.showDialog({
		// 		message : $.strings.msgPromptTouchID,
		// 		buttonNames : [$.strings.dialogBtnNotNow, $.strings.dialogBtnOK ],
		// 		cancelIndex : 0,
		// 		success : function(){
		// 			authenticator.setTouchIDEnabled(true);
		// 			$.uihelper.showDialog({
		// 				message : $.strings.msgEnabledTouchID,
		// 			});
		// 		},
		// 		cancel : function(){
		// 			authenticator.setTouchIDEnabled(false);
		// 			$.uihelper.showDialog({
		// 				message : $.strings.msgDeferredTouchID,
		// 			});
		// 		}
		// 	});
		// }


		authenticator.init({
			username : username,
			password : password,
			loginFailure : didFailed,
			success : function(passedVar){
				didAuthenticate(passedVar);		
				if( !utilities.getProperty(Alloy.CFG.touchid_prompted, false, "bool", false) && touchID.deviceCanAuthenticate() ) {
					utilities.setProperty(Alloy.CFG.touchid_prompted, true, "bool", false);
					$.uihelper.showDialog({
						message : $.strings.msgPromptTouchID,
						buttonNames : [$.strings.dialogBtnNotNow, $.strings.dialogBtnOK ],
						cancelIndex : 0,
						success : function(){
							authenticator.setTouchIDEnabled(true);
							$.uihelper.showDialog({
								message : $.strings.msgEnabledTouchID,
							});
						},
						cancel : function(){
							authenticator.setTouchIDEnabled(false);
							$.uihelper.showDialog({
								message : $.strings.msgDeferredTouchID,
							});
						}
					});
				}

			}
		});
	}
}

function didAuthenticate(passthrough) {
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
	 * First time login flow OR Account Upgraded flow takes the uesr to HIPAA screen
	 */
	if (utilities.getProperty($.usernameTxt.getValue(), null, "string", true) == "showHIPAA" || Alloy.Globals.isAccountUpgraded) {
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
	else if (mPatient && args.is_adult_partial && args.username === mPatient.get("email_address")) {
		if (args.parent === "registerChildInfo") {
			$.app.navigator.open({
				titleid : "titleAddFamily",
				ctrl : "familyMemberAdd",
				stack : false
			});
		} else {
			$.app.navigator.open({
				titleid : "titleAddAnAdult",
				ctrl : "addAnotherAdult",
				stack : false
			});
		}
	} else if (mPatient && mPatient.get("is_email_verified") !== "1" && moment.utc().diff(moment.utc(mPatient.get("created_at"), Alloy.CFG.apiCodes.ymd_date_time_format), "days", true) > 1) {
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
	if (passthrough && passthrough.callBack) {
		passthrough.callBack();
		passthrough = null;
		delete passthrough;
	}
}

function didFailed(error, passthrough) {
	if (error.errorCode == "ECOH656") {
		$.uihelper.showDialogWithButton({
			message : error.message,
			deactivateDefaultBtn : true,
			btnOptions : [{
				title : $.strings.loginErrTryAgain
			}, {
				title : $.strings.loginErrForgotUsername,
				onClick : showForgotUsernameDialog
			}]
		});
	} else if (error.errorCode == "ECOH655") {
		$.uihelper.showDialogWithButton({
			message : error.message,
			deactivateDefaultBtn : true,
			btnOptions : [{
				title : $.strings.dialogBtnOK,
				onClick : didClickForgotUsername
			}]
		});
	} else {
		$.uihelper.showDialog({
			message : error.message,
		});
	}
	;
}

function didClickForgotPassword(e) {
	$.app.navigator.open({
		ctrl : "password",
		titleid : "titleForgotPassword",
		stack : true
	});
}

function didClickForgotUsername(e) {
	$.app.navigator.open({
		ctrl : "signup",
		titleid : "titleConfirmAccount",
		stack : true
	});
}

function showForgotUsernameDialog() {
	$.uihelper.showDialog({
		message : $.strings.loginErrCofirmAccount,
		success : didClickForgotUsername
	});
}

function didClickSignup(e) {
	if (Alloy.CFG.is_proxy_enabled) {
		$.app.navigator.open({
			ctrl : "register",
			titleid : "titleRegister",
			stack : true
		});
	} else {
		$.app.navigator.open({
			ctrl : "signup",
			titleid : "titleCreateAccount",
			stack : true
		});
	}
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
		classes : ["i5", "primary-fg-color", "icon-filled-arrow-up", "right"]
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
		if (!Ti.App.accessibilityEnabled) {
			$.tooltip.show();
		};
	}

}

function didClickHide(e) {
	$.tooltip.hide();
}

exports.init = init;
