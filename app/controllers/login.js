var args = arguments[0] || {},
    app = require("core"),
    uihelper = require("uihelper"),
    utilities = require("utilities"),
    http = require("requestwrapper"),
    encryptionUtil = require("encryptionUtil"),
    keychainModule = require("com.obscure.keychain"),
    keychainAccount;

function init() {
	uihelper.getImage("logo", $.logoImg);
	Alloy.Models.user.on("change:account", updateInputs);
	keychainAccount = keychainModule.createKeychainItem(Alloy.CFG.USER_ACCOUNT);
	var account = encryptionUtil.decrypt(keychainAccount.account);
	if (account) {
		Alloy.Models.user.set({
			account : account,
			password : encryptionUtil.decrypt(keychainAccount.valueData)
		});
	}
}

function updateInputs() {
	$.unameTxt.setValue(Alloy.Models.user.get("account"));
	$.passwordTxt.setValue(Alloy.Models.user.get("password"));
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

function didAuthenticate(result) {
	Alloy.Models.user.set({
		logged_in : true,
		patients : result.data.patients
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

function didSharedMobileCheck(result) {
	var isExists = parseInt(result.data.patients.mobile_exists),
	    isShared = parseInt(result.data.patients.is_mobile_shared);
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

function didAuthenticateMobileUser(result) {
	app.navigator.open({
		ctrl : "createUsername",
		titleid : "titleCreateUsername",
		stack : true,
		ctrlArguments : {
			password : $.passwordTxt.getValue()
		}
	});
}

function didFail(error, passthrough) {
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

function terminate() {
	Alloy.Models.user.off("change:account", updateInputs);
}

exports.init = init;
exports.terminate = terminate;
