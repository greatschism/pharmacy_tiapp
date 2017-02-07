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
	// $.window.open();
}

function didChangeToggle() {
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

function moveToNext(e) {
	var nextItem = e.nextItem || false;
	if (nextItem && $[nextItem]) {
		$[nextItem].focus();
	}
}

function didClickContinue(e) {
	
	
	var email = $.emailTxt.getValue(),
	    password = $.passwordTxt.getValue();
	    
	if (!email) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.loginValUsername
		});
		return;
	}
	if(!utilities.validateEmail(email)) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.loginInfoUpdateValEmailInvalid
		});
		return;
	}
	if (!password) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.loginValPassword
		});
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
		passthrough : upgraded_info
	});
	
	/*
	var result = {"status":"SUCCESS","code":"200","errorNodeType":null,"error_id":null,"errorCode":null,"message":"Credentials updated successfully.","description":"","data":null};
	didSuccess(result, upgraded_info);*/
}

function didSuccess(result, passthrough) {
	uihelper.showDialog({
		message : result.message,
		buttonNames : [Alloy.Globals.strings.dialogBtnOK],
		cancelIndex : -1,
		success : function didOk () {
			// args.callBack = didInitWin;
			args.checkCodeValues(args);
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

function didClickCancel(e) {
	args.callBack = didInitWin;
	args.keychain.reset();
	args.logout(args);
}

function doLogout(passthrough) {
	http.request({
		method : "patient_logout",
		passthrough : passthrough,
		errorDialogEnabled : false,
		success : didInitWin,
		failure : didInitWin
	});
}

function didInitWin(e) {
	app.navigator.hideLoader();
	if (OS_ANDROID) {
		$.window.setExitOnClose(false);
	}
	$.window.close();
}

function didClickLeftNavView() {
	didInitWin(args);
}

function didAndroidback(e) {
	didInitWin(args);
}

exports.init = init;
