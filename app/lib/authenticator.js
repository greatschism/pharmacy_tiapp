var TAG = "Authenticator",
    Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    keychain = require("com.obscure.keychain").createKeychainItem(Alloy.CFG.user_account),
    authenticateCallback;

function init(callback, navigation, uname, password, remember) {
	var encryptionUtil = require("encryptionUtil");
	if (uname && password) {
		if (remember) {
			keychain.account = encryptionUtil.encrypt(uname);
			keychain.valueData = encryptionUtil.encrypt(password);
		}
	} else {
		uname = encryptionUtil.decrypt(keychain.account);
		password = encryptionUtil.decrypt(keychain.valueData);
	}
	var navigateToLogin = function() {
		authenticateCallback = null;
		var app = require("core");
		if (app.navigator.currentController.ctrlPath != "login") {
			app.navigator.open({
				ctrl : "login",
				titleid : "titleLogin",
				ctrlArguments : {
					navigation : navigation
				}
			});
		}
	};
	if (!uname || !password) {
		navigateToLogin();
		return false;
	}
	if (callback) {
		authenticateCallback = callback;
	}
	require("requestWrapper").request({
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
		failure : navigateToLogin
	});
}

function didAuthenticate(result, passthrough) {
	result.data.patients.logged_in = true;
	Alloy.Models.patient.set(result.data.patients);
	require("requestWrapper").request({
		method : "patient_get",
		params : {
			feature_code : "THXXX"
		},
		forceRetry : true,
		success : didGetPatient
	});
}

function didGetPatient(result, passthrough) {
	Alloy.Models.patient.set(result.data.patients);
	Alloy.Collections.menuItems.add({
		titleid : "titleLogout",
		action : "logout",
		icon : "logout"
	});
	if (authenticateCallback) {
		authenticateCallback();
		authenticateCallback = null;
	}
}

function reset() {
	keychain.reset();
}

function logout(isExplictLogout) {
	if (isExplictLogout === true) {
		reset();
	}
	require("requestWrapper").request({
		method : "patient_logout",
		params : {
			feature_code : "THXXX"
		},
		passthrough : isExplictLogout,
		errorDialogEnabled : false,
		retry : true,
		success : didLogout,
		failure : didLogout
	});
}

function didLogout(result, passthrough) {
	_.each(["patient", "sortOrderPreferences", "pickupModes"], function(val) {
		Alloy.Models[val].clear();
	});
	Alloy.Collections.menuItems.remove(Alloy.Collections.menuItems.findWhere({
		action : "logout"
	}));
	require("core").navigator.open(Alloy.Collections.menuItems.findWhere({
		landing_page : true
	}).toJSON());
	/**
	 *  isExplictLogout from caller
	 */
	if (passthrough === true) {
		require("uihelper").showDialog({
			message : Alloy.Globals.strings.msgLoggedout
		});
	}
}

function shouldAutoLogin() {
	return keychain.account && keychain.valueData;
}

exports.init = init;
exports.reset = reset;
exports.logout = logout;
exports.shouldAutoLogin = shouldAutoLogin;
