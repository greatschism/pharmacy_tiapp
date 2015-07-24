var TAG = "Authenticator",
    Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    app = require("core"),
    encryptionUtil = require("encryptionUtil"),
    logger = require("logger"),
    requestWrapper = require("requestWrapper"),
    keychain = require("com.obscure.keychain").createKeychainItem(Alloy.CFG.user_account),
    authenticateCallback;

function init(callback, uname, password, shouldRemember) {
	if (uname && password) {
		if (shouldRemember) {
			keychain.account = encryptionUtil.encrypt(uname);
			keychain.valueData = encryptionUtil.encrypt(password);
		}
	} else {
		uname = encryptionUtil.decrypt(keychain.account);
		password = encryptionUtil.decrypt(keychain.valueData);
	}
	if (!uname || !password) {
		logger.warn(TAG, "no user name or password");
		return false;
	}
	if (callback) {
		authenticateCallback = callback;
	}
	requestWrapper.request({
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
		failure : fireCallback
	});
}

function fireCallback() {
	if (authenticateCallback) {
		authenticateCallback();
		authenticateCallback = null;
	}
}

function logout(shouldClear) {
	requestWrapper.request({
		method : "patient_logout",
		params : {
			feature_code : "THXXX"
		},
		passthrough : shouldClear,
		success : didLogout,
		failure : didLogout
	});
}

function didLogout(result, passthrough) {
	if (passthrough !== false) {
		keychain.reset();
	}
	_.each(["patient", "sortOrderPreferences", "pickupModes","originalPharmacies"], function(val) {
		Alloy.Models[val].clear();
	});
	Alloy.Collections.menuItems.remove(Alloy.Collections.menuItems.findWhere({
		action : "logout"
	}));
	app.navigator.open(Alloy.Collections.menuItems.findWhere({
		landing_page : true
	}).toJSON());
	uihelper.showDialog({
		message : strings.msgLoggedout
	});
}

function didAuthenticate(result, passthrough) {
	result.data.patients.logged_in = true;
	Alloy.Models.patient.set(result.data.patients);
	requestWrapper.request({
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
	fireCallback();
}

exports.init = init;
exports.logout = logout;
