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


	if(OS_IOS && Alloy.CFG.is_fingerprint_scanner_enabled && authenticator.getTouchIDEnabled()) {

		//$.touchIDLoginSwt.setValue(true);

		if(args.requires_login_auth === true) {

		 	var result = touchID.deviceCanAuthenticate();
		 
		 	var passcodeAuthProcess = function () {

		 		touchID.authenticate(function(tIDResp) {
		 			setTimeout( function(){

							touchIDAuth({"success":true}); 
		 				},0);

					}, function(tIDResp) {
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
	iDict.accessibilityLabel = $.strings.accessibilityLblRememberUsernameToggle;
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
					
				}
			}) , 0);

	} else {
		alert($.strings.loginTouchCancel);
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
			message : $.strings.msgAutoLogin,
			success : function(){
				if(authenticator.getTouchIDEnabled()) {
					$.uihelper.showDialog({
						message : $.strings.msgTouchIDLearnMore,
					});
				} 
			}
		});
	}
}

function moveToNext(e) {
	var nextItem = e.nextItem || false;
	if (nextItem && $[nextItem]) {
		$[nextItem].focus();
	}
}
function loginProcess(e) {
	var username = $.usernameTxt.getValue(),
	    password = $.passwordTxt.getValue();

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

	Ti.API.info("!!!!!!!!!!!!  is_fingerprint_scanner_enabled  !!!!!!!!!!!!!!!!!!! ===== "+Alloy.CFG.is_fingerprint_scanner_enabled )
	Ti.API.info("!!!!!!!!!!!!  touchID.deviceCanAuthenticate  !!!!!!!!!!!!!!!!!!! ===== "+touchID.deviceCanAuthenticate() )


	authenticator.init({
		username : username,
		password : password,
		loginFailure : didFailed,
		success : function(passedVar){	
			if( !utilities.getProperty(Alloy.CFG.touchid_prompted, false, "bool", false) && touchID.deviceCanAuthenticate() && OS_IOS && Alloy.CFG.is_fingerprint_scanner_enabled) {
				utilities.setProperty(Alloy.CFG.touchid_prompted, true, "bool", false);

				Ti.API.info("!!!!!!!!!!!!  getProperty(Alloy.CFG.touchid_prompted)  !!!!!!!!!!!!!!!!!!! ===== "+utilities.getProperty(Alloy.CFG.touchid_prompted) )
				Ti.API.info("!!!!!!!!!!!!  OS_IOS  !!!!!!!!!!!!!!!!!!! ===== "+OS_IOS )

				var dialogView = $.UI.create("ScrollView", {
					apiName : "ScrollView",
					classes : ["top", "auto-height", "vgroup"]
				});
				dialogView.add($.UI.create("Label", {
					apiName : "Label",
					classes : ["margin-top-extra-large", "margin-left-large", "margin-right-large", "h3", "txt-center"],
					text : Alloy.Globals.strings.msgPromptTouchID
				}));
				var buttonView = $.UI.create("View", {
					apiName : "View",
					classes : ["margin-left", "margin-top-large", "auto-height", "hgroup"]
				});
				_.each([ {
					title : "no",
					classes : ["margin-left", "margin-right", "bg-color", "auto-height", "width-45", "left",  "hgroup", "primary-fg-color", "primary-border"]
				}, {
					title : "YES",
					classes : ["margin-left", "auto-height", "margin-right", "right", "width-45",   "hgroup", "primary-bg-color", "primary-font-color", "primary-border"]
				}], function(obj, index) {
					var btn = $.UI.create("Button", {
						apiName : "Button",
						classes : obj.classes,
						title : obj.title,
						index : index
					});
					$.addListener(btn, "click",  function(event) {
						var index = event.source.index;
						var message =  $.strings.msgDeferredTouchID;
						if( index === 1 ) {
							authenticator.setTouchIDEnabled(true);
							message =  $.strings.msgEnabledTouchID;
						} else {
							authenticator.setTouchIDEnabled(false);
						}

						$.uihelper.showDialog({
							message : message,
							success : function(){
								didAuthenticate(passedVar);	
							}
						});	
						$.tID.hide();
					});
					buttonView.add(btn);
				});
				dialogView.add(buttonView);
				dialogView.add($.UI.create("Label", {
					apiName : "Label",
					classes : ["margin-top-extra-large", "margin-left", "h7", "margin-right"],
					text : Alloy.Globals.strings.msgTouchIDNote
				}));
				var moreInfo = $.UI.create("Label", {
					apiName : "Label",
					classes : ["margin-top-extra-large", "margin-bottom-extra-large", "margin-left-extra-large", "h8", "negative-fg-color", "margin-right-extra-large", "txt-center"],
					text : Alloy.Globals.strings.msgTouchIDLearnMore
				});

				dialogView.add(moreInfo);
				$.addListener(moreInfo, "click", 
					function(event) {
						var index = event.source.index;

						$.uihelper.showDialog({
							title : "",
							message : Alloy.Globals.strings.msgTouchIDLearnMoreInfo,
							buttonNames : [$.strings.dialogBtnOK ]
						});
				});
				// if (OS_ANDROID) {
				// 	$.tID = Ti.UI.createAlertDialog({
				//     	androidView : dialogView
				//   	});
				// } else{
					$.tID = Alloy.createWidget("ti.modaldialog", "widget", $.createStyle({
						classes : ["modal-dialog"],
						children : [dialogView]
					}));
				Ti.API.info("!!!!!!!!!!!!  will add to content view !!!!!!!!!!!!!!!!!!! ===== " )
					$.contentView.add($.tID.getView());
				//}
				$.tID.show();


				Ti.API.info("!!!!!!!!!!!!  $.tID.show(); !!!!!!!!!!!!!!!!!!! ===== " )

				// $.uihelper.showDialog({
				// 	message : $.strings.msgPromptTouchID,
				// 	buttonNames : [$.strings.dialogBtnNotNow, $.strings.dialogBtnOK ],
				// 	cancelIndex : 0,
				// 	success : function() {
				// 		$.uihelper.showDialog({
				// 			message : $.strings.msgTouchIDDisclaimer,
				// 			success : function(){
				// 				authenticator.setTouchIDEnabled(true);
				// 				if(!authenticator.getAutoLoginEnabled()) {
				// 					$.uihelper.showDialog({
				// 						message : $.strings.msgEnabledTouchID,
				// 					});
				// 				} else {
				// 					$.uihelper.showDialog({
				// 						message : $.strings.msgEnabledTouchIDwKeep,
				// 						buttonNames : [$.strings.dialogBtnNo, $.strings.dialogBtnYes],
				// 						cancelIndex : 0,
				// 						success : function() {
				// 							authenticator.setAutoLoginEnabled(false);
				// 							$.uihelper.showDialog({
				// 								message : $.strings.msgTouchIDwKeepTurnedOff,
				// 							});
				// 						}
				// 					});
				// 				}
				// 			}
				// 		});
				// 	},
				// 	cancel : function(){
				// 		authenticator.setTouchIDEnabled(false);
				// 		$.uihelper.showDialog({
				// 			message : $.strings.msgDeferredTouchID,
				// 		});
				// 	}
				// });





			} else {
				didAuthenticate(passedVar);	
			}

		}
	});
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

	//Solution for risk 3: prior to a user tapping ‘sign-in’, the username/password provided is checked against the username stored in the device keychain for Touch ID — 
	//if it does not match, then Touch ID must be immediately disabled prior to the login attempt. At this point, the user should be informed that Touch ID has been 
	//	disabled for login since the credentials of this login attempt did not match the previous ones used for Touch ID.
	if( authenticator.getTouchIDEnabled() ) {

		var data = authenticator.forceGetData();
		var oldusername = data.username;
		var oldpassword = data.password;

		if( (oldpassword !== password) || (oldusername !== username) ) {
			$.uihelper.showDialog({
				message : $.strings.msgTouchIDReset,
				success : function(e){
					utilities.setProperty(Alloy.CFG.touchid_prompted, false, "bool", false);
					authenticator.setTouchIDEnabled(false);
					loginProcess(e);
				}
			});
		} else {
			loginProcess(e);
		}


	} else {
		loginProcess(e);
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
		if (Alloy.Globals.is_hipaa_url_enabled) {
			$.app.navigator.open({
				ctrl : "hipaa",
				titleid : "titleHIPAAauthorization",
				stack : false
			});
		} else {
			/**
			 * remove the entry from the properties so that HIPAA is not displayed to the user next time
			 */
			utilities.removeProperty(Alloy.Collections.patients.at(0).get("email_address"));
			if (Alloy.CFG.is_express_checkout_enabled) {
				$.app.navigator.open({
					titleid : "titleExpressPickupBenefits",
					ctrl : "expressPickupBenefits",
					stack : false
				});
			} else {
				currentPatient = Alloy.Collections.patients.findWhere({
					selected : true
				});

				if (currentPatient.get("mobile_number") && currentPatient.get("is_mobile_verified") === "1") {
					$.app.navigator.open({
						titleid : "titleHomePage",
						ctrl : "home",
						stack : false
					});
				} else {
					$.app.navigator.open({
						titleid : "titleTextBenefits",
						ctrl : "textBenefits",
						stack : false
					});
				};
			}
		}
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
			titleid : "titleEmailVerify",
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
	$.autoLoginView.removeEventListener("postlayout", didPostlayout);
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
		top : OS_IOS ? $.autoLoginView.rect.y + $.autoLoginView.rect.height : $.autoLoginView.rect.y - $.autoLoginView.rect.height,
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
