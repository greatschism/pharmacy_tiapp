var args = $.args,
    moment = require("alloy/moment"),
    apiCodes = Alloy.CFG.apiCodes,
    rightButtonDict = $.createStyle({
	classes : ["txt-positive-right-btn","positive-fg-color"],
	title : Alloy.Globals.strings.strShow,
	width: "25%",
	backgroundColor: 'transparent'
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

	$.askInfoLbl.text = Alloy.Globals.strings.loginInfoUpdateAskInfo;
	uihelper.getImage("logo", $.logoImg);
	$.childAccInfoAttr.text = String.format(Alloy.Globals.strings.mgrAccountUpdateChildAccInfoAttr,Alloy.Globals.strings.strClientName);
	$.passwordTxt.tooltip = Alloy.Globals.strings.msgPasswordTips;
	$.containerView.addEventListener("postlayout", didPostlayoutPasswordContainerView);
}

function focus() {
	var height = $.uihelper.getHeightFromChildren($.nameView);
	$.nameVDividerView.height = height;
}

function setParentView(view) {
	$.dobDp.setParentView(view);
}

function moveToNext(e) {
	var nextItem = e.nextItem || false;
	if (nextItem && $[nextItem]) {
		$[nextItem].focus();
	}
}

function didChangePhone(e) {
	var value = $.utilities.formatPhoneNumber(e.value),
	    len = value.length;
	$.phoneTxt.setValue(value);
	$.phoneTxt.setSelection(len, len);
}

function didToggleShowPassword() {
	if (Alloy.CFG.toggle_password_enabled) {
		if ($.passwordTxt.getPasswordMask()) {
			$.passwordTxt.setPasswordMask(false);
			_.extend(rightButtonDict, {
				title : Alloy.Globals.strings.strHide,
				width: "25%",
				backgroundColor: 'transparent'
			});
		} else {
			$.passwordTxt.setPasswordMask(true);
			_.extend(rightButtonDict, {
				title : Alloy.Globals.strings.strShow,
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

function didBlurFocusPassword() {
	$.passwordTooltip.hide();
}

function didFocusPassword(e) {
		$.passwordTooltip.updateArrow($.createStyle({
			classes : ["direction-down"]
		}).direction, $.createStyle({
			classes : ["i5", "inactive-fg-color", "icon-filled-arrow-down"]
		}));
	
	if (_.has($.passwordTooltip, "size")) {
		$.passwordTooltip.applyProperties({
			top : (passwordContainerViewFromTop + $.containerView.top ) 
		});
		delete $.passwordTooltip.size;
	}
	$.passwordTooltip.show();
}

function didPostlayoutPasswordContainerView(e) {
	$.containerView.removeEventListener("postlayout", didPostlayoutPasswordContainerView);
	passwordContainerViewFromTop = e.source.rect.y - 15;
}

function didPostlayoutTooltip(e) {
	e.source.size = e.size;
	e.source.off("postlayout", didPostlayoutTooltip);
}

function didClickTooltip(e) {
	e.source.hide();
}

function didClickAgreement(e) {
	$.app.navigator.open({
		ctrl : "termsAndConditions",
		titleid : "titleTermsAndConditions",
		stack : true,
		ctrlArguments : {
			registrationFlow : true
		}
	});
}

function didClickAccountExists(){
	args.keychain.reset();
	$.app.navigator.open({
		titleid:"titleFamilyCare",
		ctrl : "childAccountTips",
		stack : true
	});
}

function didClickContinue() {
	var fname = $.fnameTxt.getValue(),
	    lname = $.lnameTxt.getValue(),
	    password = $.passwordTxt.getValue(),
	    phone = $.phoneTxt.getValue(),
	    email = $.emailTxt.getValue(),
	    dob = $.dobDp.getValue();
	    phone = $.utilities.validatePhoneNumber(phone);

	if (!phone) {
		$.uihelper.showDialog({
			message : $.strings.phoneValPhoneInvalid
		});
		return;
	}
	if (!fname) {
		$.uihelper.showDialog({
			message : $.strings.mgrAccountCreationValFirstName
		});
		return;
	}
	if (!$.utilities.validateName(fname)) {
		$.uihelper.showDialog({
			message : $.strings.mgrAccountCreationValFirstNameInvalid
		});
		return;
	}
	if (!lname) {
		$.uihelper.showDialog({
			message : $.strings.mgrAccountCreationValLastName
		});
		return;
	}
	if (!$.utilities.validateName(lname)) {
		$.uihelper.showDialog({
			message : $.strings.mgrAccountCreationValLastNameInvalid
		});
		return;
	}
	if (!dob) {
		$.uihelper.showDialog({
			message : $.strings.mgrAccountCreationValDob
		});
		return;
	}
	if (!password) {
		$.uihelper.showDialog({
			message : $.strings.mgrAccountCreationValPasssword
		});
		return;
	}
	if (!$.utilities.validatePassword(password)) {
		$.uihelper.showDialog({
			message : Alloy.Globals.strings.registerValPasswordInvalid
		});
		return;
	}
	if (!email) {
		$.uihelper.showDialog({
			message : $.strings.mgrAccountCreationValEmail
		});
		return;
	}
	if (!$.utilities.validateEmail(email)) {
		$.uihelper.showDialog({
			message : $.strings.mgrAccountCreationValEmailInvalid
		});
		return;
	}
	if (moment().diff(dob, "years", true) < 18) {
		$.uihelper.showDialog({
			message : String.format(Alloy.Globals.strings.msgAgeRestriction, Alloy.Models.appload.get("supportphone")),
		});
		return;
	}
	
	var upgraded_info = {
		email : email,
		password : password
	};
	
	$.http.request({
		method : "patient_manager_add",
		params : {
			data : [{
				patient : {
					password : password,
					first_name : fname,
					last_name : lname,
					birth_date : moment(dob).format(Alloy.CFG.apiCodes.dob_format),
					mobile : "1" + phone,
					email_address : email,
				}
			}]

		},
		success : didSuccess,
		failure : didFailed,
		passthrough : upgraded_info
	});
}

function didSuccess(result, passthrough) {
	
	var is_auto_login_enabled = utilities.getProperty(Alloy.CFG.auto_login_enabled, false, "bool", false);
	if (is_auto_login_enabled) {
		/**
		 * store username and password
		 * on keychain
		 */
		args.keychain.reset();
		args.keychain.account = encryptionUtil.encrypt(passthrough.email);
		args.keychain.valueData = encryptionUtil.encrypt(passthrough.password);
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
		passthrough.errorDialogEnabled = true;
	}
	
	utilities.setProperty("familyMemberAddPrescFlow", false, "bool", true);
	uihelper.showDialog({
		message : result.message,
		buttonNames : [Alloy.Globals.strings.dialogBtnOK],
		cancelIndex : -1,
		success : function didOk () {
			app.navigator.open({
				ctrl : "login",
				titleid : "titleLogin",
				ctrlArguments : {
					username : passthrough.email,
					password : passthrough.password
				}
			});
		}
	});
}

function didFailed() {
	
}

function didClickHide(e) {
	$.tooltip.hide();
}

function didOpen(e) {
	$.trigger("init");
}

function backButtonHandler() {
	app.navigator.showLoader();
	didClickCancel();
}

function didClickCancel() {
	args.keychain.reset();
	didInitWin();
}


function didInitWin(passthrough) {
	app.navigator.hideLoader();
	app.navigator.open({
		ctrl : "login",
		titleid : "titleLogin"
	});	
}

function didClickLeftNavView(e) {
	didClickCancel(e);
}

function didAndroidback(e) {
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
exports.setParentView = setParentView;
exports.focus = focus;
exports.backButtonHandler = backButtonHandler;
