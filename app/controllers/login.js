var args = arguments[0] || {},
    encryptionUtil = require("encryptionUtil"),
    keychainModule = require("com.obscure.keychain"),
    keychainAccount;

function init() {
	$.uihelper.getImage("logo", $.logoImg);
	Alloy.Models.patient.on("change:account", updateInputs);
	keychainAccount = keychainModule.createKeychainItem(Alloy.CFG.user_account);
	var account = encryptionUtil.decrypt(keychainAccount.account);
	if (account) {
		Alloy.Models.patient.set({
			account : account,
			password : encryptionUtil.decrypt(keychainAccount.valueData)
		});
		$.keepMeSwt.setValue(true);
	}
}

function updateInputs() {
	$.unameTxt.setValue(Alloy.Models.patient.get("account"));
	$.passwordTxt.setValue(Alloy.Models.patient.get("password"));
}

function moveToNext(e) {
	var nextItem = e.nextItem || false;
	if (nextItem && $[nextItem]) {
		$[nextItem].focus();
	} else {
		didClickLogin();
	}
}

function didClickLogin(e) {
	var uname = $.unameTxt.getValue(),
	    password = $.passwordTxt.getValue();
	if (!uname) {
		$.uihelper.showDialog({
			message : Alloy.Globals.strings.valUsernameRequired
		});
		return;
	}
	if (!password) {
		$.uihelper.showDialog({
			message : Alloy.Globals.strings.valPasswordRequired
		});
		return;
	}
	if ($.keepMeSwt.getValue() === true) {
		keychainAccount.account = encryptionUtil.encrypt(uname);
		keychainAccount.valueData = encryptionUtil.encrypt(password);
	} else {
		keychainAccount.reset();
	}
	if ($.utilities.isMobileNumber(uname)) {
		$.http.request({
			method : "patients_mobile_exists_or_shared",
			params : {
				feature_code : "THXXX",
				data : [{
					patient : {
						mobile_number : uname
					}
				}]
			},
			keepLoader : true,
			success : didSharedMobileCheck,
			failure : didFailRequest
		});
	} else {
		$.http.request({
			method : "patient_authenticate",
			params : {
				feature_code : "THXXX",
				data : [{
					patient : {
						user_name : uname,
						password : password
					}
				}]
			},
			keepLoader : true,
			success : didAuthenticate,
			failure : didFailRequest
		});
	}
}

function didAuthenticate(result) {
	_.extend(result.data.patients, {
		logged_in : true
	});
	Alloy.Models.patient.set(result.data.patients);
	Alloy.Collections.menuItems.add({
		titleid : "strSignout",
		action : "signout",
		icon : "sign_out"
	});
	$.http.request({
		method : "patient_get",
		params : {
			feature_code : "THXXX",
			data : [{
				patient : {}
			}]
		},
		forceRetry : true,
		success : didGetUserDetails
	});
}

function didGetUserDetails(result) {
	Alloy.Models.patient.set(result.data.patients);
	$.app.navigator.open(args.navigation || Alloy.Collections.menuItems.findWhere({
		landing_page : true
	}).toJSON());
}

function didSharedMobileCheck(result) {
	var isExists = parseInt(result.data.patients.mobile_exists),
	    isShared = parseInt(result.data.patients.is_mobile_shared);
	if (isExists && isShared) {
		$.app.navigator.hideLoader();
		$.app.navigator.open({
			ctrl : "sharedMobileCheck",
			stack : true,
			ctrlArguments : {
				orgin : $.__controllerPath,
				mobileNumber : $.unameTxt.getValue(),
				password : $.passwordTxt.getValue()
			}
		});
	} else {
		$.http.request({
			method : "patients_authenticate",
			params : {
				feature_code : "THXXX",
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
	$.app.navigator.open({
		ctrl : "createUsername",
		titleid : "titleCreateUsername",
		stack : true,
		ctrlArguments : {
			password : $.passwordTxt.getValue()
		}
	});
}

function didFailRequest(error, passthrough) {
	$.app.navigator.hideLoader();
}

function didClickPwd(e) {
	$.app.navigator.open({
		ctrl : "loginRecovery",
		titleid : "titleLoginRecovery",
		stack : true
	});
}

function didClickSignup(e) {
	$.app.navigator.open({
		ctrl : "mobileNumber",
		titleid : "strWelcome",
		stack : true
	});
}

function terminate() {
	Alloy.Models.patient.off("change:account", updateInputs);
	Alloy.Models.patient.set({
		account : null,
		password : null
	});
}

exports.init = init;
exports.terminate = terminate;
