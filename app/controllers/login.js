var args = arguments[0] || {},
    app = require("core"),
    uihelper = require("uihelper"),
    utilities = require("utilities"),
    http = require("requestwrapper"),
    encryptionUtil = require("encryptionUtil"),
    keychainModule = require("com.obscure.keychain"),
    keychainAccount;

function init() {
	uihelper.getImage($.logoImg);
	updateInputs();
}

function updateInputs() {
	keychainAccount = keychainModule.createKeychainItem(Alloy.CFG.USER_ACCOUNT);
	$.unameTxt.setValue(encryptionUtil.decrypt(keychainAccount.account));
	$.passwordTxt.setValue(encryptionUtil.decrypt(keychainAccount.valueData));
	if (keychainAccount.valueData) {
		$.keepMeSwt.setValue(true);
	}
}

function moveToNext(e) {
	var nextItem = e.nextItem || false;
	nextItem ? $[nextItem] && $[nextItem].focus() : didClickLogin();
}

function didClickLogin(e) {
	var uname = $.unameTxt.getValue(),
	    password = $.passwordTxt.getValue();
	if (!uname) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.valUsernameRequired
		});
		return;
	}
	if (!password) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.valPasswordRequired
		});
		return;
	}
	if ($.keepMeSwt.getValue() == true) {
		keychainAccount.account = encryptionUtil.encrypt(uname);
		keychainAccount.valueData = encryptionUtil.encrypt(password);
	} else {
		keychainAccount.reset();
	}
	if (utilities.isMobileNumber(uname)) {
		http.request({
			method : "PATIENTS_MOBILE_EXISTS_OR_SHARED",
			data : {
				data : [{
					patient : {
						mobile_number : uname
					}
				}]
			},
			success : didSharedMobileCheck,
			failure : didFail,
			keepLoader : true
		});
	} else {
		http.request({
			method : "PATIENTS_AUTHENTICATE",
			data : {
				data : [{
					patient : {
						user_name : uname,
						password : password
					}
				}]
			},
			success : didAuthenticate
		});
	}
}

function didAuthenticate(_result) {
	Alloy.Models.user.set({
		logged_in : true,
		patients : _result.data.patients
	});
	Alloy.Collections.menuItems.add({
		titleid : "strSignout",
		action : "signout",
		icon : "remove"
	});
	app.navigator.open(args.navigation || Alloy.Collections.menuItems.where({
	landing_page: true
	})[0].toJSON());
}

function didSharedMobileCheck(_result) {
	var isExists = parseInt(_result.data.patients.mobile_exists),
	    isShared = parseInt(_result.data.patients.is_mobile_shared);
	if (isExists && isShared) {
		app.navigator.hideLoader();
		app.navigator.open({
			ctrl : "sharedMobileCheck",
			stack : true,
			ctrlArguments : {
				orgin : $.__controllerPath,
				mobileNumber : $.unameTxt.getValue(),
				password : $.passwordTxt.getValue()
			}
		});
	} else {
		http.request({
			method : "PATIENTS_AUTHENTICATE",
			data : {
				data : [{
					patient : {
						user_name : $.unameTxt.getValue(),
						password : $.passwordTxt.getValue()
					}
				}]
			},
			success : didAuthenticateMobileUser
		});
	}
}

function didAuthenticateMobileUser(_result) {
	app.navigator.open({
		ctrl : "createUsername",
		titleid : "titleCreateUsername",
		stack : true,
		ctrlArguments : {
			password : $.passwordTxt.getValue()
		}
	});
}

function didFail(_passthrough) {
	app.navigator.hideLoader();
}

function handleScroll(e) {
	$.login.canCancelEvents = e.value;
}

function didClickPwd(e) {
	app.navigator.open({
		ctrl : "loginRecovery",
		titleid : "titleLoginRecovery",
		stack : true
	});
}

function didClickSignup(e) {
	app.navigator.open({
		ctrl : "mobileNumber",
		titleid : "strWelcome",
		stack : true
	});
}

exports.init = init;
exports.focus = updateInputs;
