var TAG = "Authenticator",
    Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    moment = require("alloy/moment"),
    app = require("core"),
    utilities = require("utilities"),
    uihelper = require("uihelper"),
    encryptionUtil = require("encryptionUtil"),
    http = require("requestwrapper"),
    localization = require("localization"),
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
		keepLoader : true,
		forceRetry : true,
		success : didGetPreferences
	});
}

function didGetPreferences(result, passthrough) {
	Alloy.Models.patient.set(result.data.patients.preferences);
	/**
	 * code values check
	 * can be removed from account controller
	 * as we get it here itself
	 */
	http.request({
		method : "codes_get",
		params : {
			feature_code : "THXXX",
			data : [{
				codes : [{
					code_name : Alloy.CFG.apiCodes.code_language
				}, {
					code_name : Alloy.CFG.apiCodes.code_time_zone
				}]
			}]
		},
		forceRetry : true,
		success : didGetCodeValues
	});
}

function didGetCodeValues(result, passthrough) {
	Alloy.Models.language.set(result.data.codes[0]);
	Alloy.Models.timeZone.set(result.data.codes[1]);
	appendFlag(Alloy.Models.timeZone.get("code_values"), Alloy.Models.patient.get("pref_timezone"));
	appendFlag(Alloy.Models.language.get("code_values"), localization.currentLanguage.code);
	/**
	 * set prefered time zone
	 * before that store the user
	 * device time to validate whether
	 * there is a mismatch
	 */
	var dateObj = new Date(Alloy.CFG.default_date),
	    dFormat = Alloy.CFG.date_time_format,
	    dDate = moment(dateObj).format(dFormat);
	setTimeZone(Alloy.Models.patient.get("pref_timezone"));
	/**
	 * add logout menu item
	 */
	Alloy.Collections.menuItems.add({
		titleid : "titleLogout",
		action : "logout",
		icon : "logout"
	});
	/**
	 * check if user is on different time zone
	 * then one he had chosen
	 */
	if (Alloy.CFG.time_zone_check_enabled && dDate != moment(dateObj).format(dFormat)) {
		/**
		 * momentjs or any other library
		 * doesn't give a proper way
		 * to detect user's time zone name
		 * so compare current time with
		 * all supported time zones
		 */
		var currentTZCode;
		_.some(Alloy.Models.timeZone.get("code_values"), function(code) {
			if (dDate === moment(dateObj).tz(code.code_value).format(dFormat)) {
				currentTZCode = code;
				return true;
			}
			return false;
		});
		if (currentTZCode) {
			/**
			 * user is on a different time zone
			 * that we support
			 */
			uihelper.showDialog({
				title : Alloy.Globals.strings.dialogTitleTimeZone,
				message : Alloy.Globals.strings.msgTimeZoneUpdate,
				buttonNames : [Alloy.Globals.strings.dialogBtnYes, Alloy.Globals.strings.dialogBtnNo],
				cancelIndex : 1,
				success : function didConfirmTimeZone() {
					updateTimeZone(currentTZCode);
				},
				cancel : fireCallback
			});
		} else {
			/**
			 * user is on a time zone
			 * that we don't support
			 */
			uihelper.showDialog({
				title : Alloy.Globals.strings.dialogTitleTimeZone,
				message : Alloy.Globals.strings.msgTimeZoneInvalid,
				buttonNames : [Alloy.Globals.strings.dialogBtnOK],
				cancelIndex : 0,
				cancel : fireCallback
			});
		}
	} else {
		fireCallback();
	}
}

/**
 * adding selected flags
 * to code values
 */
function appendFlag(codes, selectedValue) {
	_.each(codes, function(code) {
		code.selected = code.code_value === selectedValue;
	});
}

function updateTimeZone(timeZone) {
	/**
	 * to do: implement user preferences set
	 * for time zone. api is not ready yet
	 */
	fireCallback();
}

function fireCallback() {
	if (authenticateCallback) {
		authenticateCallback();
		authenticateCallback = null;
	}
}

function logout(isExplicitLogout, callback) {
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
		passthrough : {
			isExplicitLogout : isExplicitLogout,
			callback : callback
		},
		errorDialogEnabled : false,
		success : didLogout,
		failure : didLogout
	});
}

function didLogout(result, passthrough) {
	/**
	 * reset to device time zone
	 */
	setTimeZone(null);
	/**
	 * reset models and collections
	 */
	_.each(["patient", "storeOriginal", "sortOrderPreferences", "pickupModes"], function(val) {
		Alloy.Models[val].clear();
	});
	Alloy.Collections.menuItems.remove(Alloy.Collections.menuItems.findWhere({
		action : "logout"
	}));
	if (passthrough.callback) {
		passthrough.callback();
	} else {
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
		if (passthrough.isExplicitLogout === true) {
			uihelper.showDialog({
				message : Alloy.Globals.strings.msgLoggedout
			});
		}
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

function setTimeZone(zone) {
	moment.tz.setDefault(zone);
	/**
	 * update the last request time
	 * as the time zone is updated now
	 */
	Alloy.Globals.latestRequest = moment().unix();
}

exports.init = init;
exports.logout = logout;
exports.getData = getData;
exports.setTimeZone = setTimeZone;
exports.setAutoLoginEnabled = setAutoLoginEnabled;
exports.getAutoLoginEnabled = getAutoLoginEnabled;
