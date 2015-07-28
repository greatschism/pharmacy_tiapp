var TAG = "Authenticator",
    Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    app = require("core"),
    utilities = require("utilities"),
    uihelper = require("uihelper"),
    encryptionUtil = require("encryptionUtil"),
    http = require("requestwrapper"),
    keychain = require("com.obscure.keychain").createKeychainItem(Alloy.CFG.user_account),
    authenticateCallback;

function init(callback, navigation, username, password) {
	/**
	 * for auto-login let errorDialogEnabled be false
	 * any ways on failure we are going to login screen only
	 */
	var errorDialogEnabled = false;
	if (username && password) {
		/**
		 * store username and password
		 * on keychain
		 */
		keychain.account = encryptionUtil.encrypt(username);
		keychain.valueData = encryptionUtil.encrypt(password);
		/**
		 * reset latest_logout_explicit flag
		 * if latest_logout_explicit true
		 * then the only way for login is login screen
		 * so reset the last value here
		 */
		utilities.setProperty(Alloy.CFG.latest_logout_explicit, false, "bool", false);
		/**
		 * if this request is from login screen
		 * we will have valid user name and password parameters
		 * and errorDialogEnabled should be true
		 */
		errorDialogEnabled = true;
	} else if (getAutoLoginEnabled() && !utilities.getProperty(Alloy.CFG.latest_logout_explicit, false, "bool", false)) {
		username = encryptionUtil.decrypt(keychain.account);
		password = encryptionUtil.decrypt(keychain.valueData);
	}
	var navigateToLogin = function() {
		authenticateCallback = null;
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
	if (!username || !password) {
		navigateToLogin();
		return false;
	}
	if (callback) {
		authenticateCallback = callback;
	}
	http.request({
		method : "patient_authenticate",
		params : {
			feature_code : "THXXX",
			data : [{
				patient : {
					user_name : username,
					password : password
				}
			}]
		},
		keepLoader : true,
		errorDialogEnabled : errorDialogEnabled,
		success : didAuthenticate,
		failure : navigateToLogin
	});
}

function didAuthenticate(result, passthrough) {
	Alloy.Models.patient.set(result.data.patients);
	http.request({
		method : "patient_get",
		params : {
			feature_code : "THXXX"
		},
		keepLoader : true,
		forceRetry : true,
		success : didGetPatient
	});
}

function didGetPatient(result, passthrough) {
	Alloy.Models.patient.set(result.data.patients);
	http.request({
		method : "patient_preferences_get",
		params : {
			feature_code : "THXXX"
		},
		forceRetry : true,
		success : didGetPreferences
	});
}

function didGetPreferences(result, passthrough) {
	Alloy.Models.patient.set(result.data.patients.preferences);
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

function logout(isExplicitLogout) {
	/**
	 * on explicit log out just
	 * update the flag. user name
	 * and password will be auto populated
	 * based on configuration in login page
	 * and no auto login will take place
	 */
	if (isExplicitLogout) {
		utilities.setProperty(Alloy.CFG.latest_logout_explicit, true, "bool", false);
	}
	http.request({
		method : "patient_logout",
		params : {
			feature_code : "THXXX"
		},
		passthrough : isExplicitLogout,
		errorDialogEnabled : false,
		success : didLogout,
		failure : didLogout
	});
}

function didLogout(result, passthrough) {
	_.each(["patient", "storeOriginal", "sortOrderPreferences", "pickupModes"], function(val) {
		Alloy.Models[val].clear();
	});
	Alloy.Collections.menuItems.remove(Alloy.Collections.menuItems.findWhere({
		action : "logout"
	}));
	app.navigator.open(Alloy.Collections.menuItems.findWhere({
		landing_page : true
	}).toJSON());
	/**
	 *  isExplicitLogout from caller
	 *  then only show the logout dialog
	 *  otherwise we would have shown the
	 *  session expired dialog already
	 *  so no need to show this dialog again
	 */
	if (passthrough === true) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.msgLoggedout
		});
	}
}

function getData() {
	return {
		username : Alloy.CFG.auto_populate_username ? encryptionUtil.decrypt(keychain.account) : "",
		password : Alloy.CFG.auto_populate_password ? encryptionUtil.decrypt(keychain.valueData) : ""
	};
}

function setAutoLoginEnabled(value) {
	utilities.setProperty(Alloy.CFG.auto_login_enabled, value, "bool", false);
	/**
	 * immediately reset the keychain if false
	 * user wants to disable it
	 * this may be called from login or account page
	 */
	if (!value) {
		keychain.reset();
	}
}

function getAutoLoginEnabled() {
	return utilities.getProperty(Alloy.CFG.auto_login_enabled, false, "bool", false);
}

exports.init = init;
exports.logout = logout;
exports.getData = getData;
exports.setAutoLoginEnabled = setAutoLoginEnabled;
exports.getAutoLoginEnabled = getAutoLoginEnabled;
