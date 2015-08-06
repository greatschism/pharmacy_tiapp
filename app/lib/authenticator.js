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
    keychain = require("com.obscure.keychain").createKeychainItem(Alloy.CFG.user_account);

function init(options) {
	if (!options) {
		options = {};
	}
	/**
	 * by default
	 * errorDialogEnabled will be false
	 */
	options.errorDialogEnabled = false;
	/**
	 * check username
	 * and password
	 */
	var username = options.username,
	    password = options.password;
	if (username && password) {
		/**
		 * store username and password
		 * on keychain
		 */
		keychain.account = encryptionUtil.encrypt(username);
		keychain.valueData = encryptionUtil.encrypt(password);
		/**
		 * reset lastest_logout_explicit
		 * reset the last value here
		 */
		utilities.setProperty(Alloy.CFG.lastest_logout_explicit, false, "bool", false);
		/**
		 * errorDialogEnabled is enabled
		 * when this is a explicit login
		 * usually happens from login screen
		 * when options has a valid username
		 * and password properties
		 */
		options.errorDialogEnabled = true;
	} else if (getAutoLoginEnabled() && !utilities.getProperty(Alloy.CFG.lastest_logout_explicit, false, "bool", false)) {
		username = encryptionUtil.decrypt(keychain.account);
		password = encryptionUtil.decrypt(keychain.valueData);
	}
	/**
	 * happens when auto login is turned on
	 * but there was a explicit logout or session timeout
	 */
	if (!username || !password) {
		didFailPatient({}, options);
		return false;
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
		passthrough : options,
		keepLoader : true,
		errorDialogEnabled : options.errorDialogEnabled,
		success : didAuthenticate,
		failure : didFailPatient
	});
}

/**
 * common failure callback
 * for authenticate and patient get
 * both services are tightly coupled
 * with service provider.
 */
function didFailPatient(error, passthrough) {
	Alloy.Models.patient.clear();
	if (passthrough.failure) {
		passthrough.failure();
	} else if (app.navigator.currentController.ctrlPath != "login") {
		app.navigator.open({
			ctrl : "login",
			titleid : "titleLogin",
			ctrlArguments : {
				navigation : passthrough.navigation
			}
		});
	}
}

function didAuthenticate(result, passthrough) {
	Alloy.Models.patient.set(result.data.patients);
	http.request({
		method : "patient_get",
		params : {
			feature_code : "THXXX"
		},
		passthrough : passthrough,
		keepLoader : true,
		errorDialogEnabled : passthrough.errorDialogEnabled,
		success : didGetPatient,
		failure : didFailPatient
	});
}

function didGetPatient(result, passthrough) {
	Alloy.Models.patient.set(result.data.patients);
	http.request({
		method : "patient_preferences_get",
		params : {
			feature_code : "THXXX"
		},
		passthrough : passthrough,
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
		passthrough : passthrough,
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
	    dDate = moment(dateObj).format(dFormat),
	    currentTZCode;
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
	 * execute callback
	 */
	var fireCallback = function() {
		if (passthrough.success) {
			passthrough.success();
		}
	};
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
				success : function didConfirm() {
					passthrough.timeZone = currentTZCode;
					updateTimeZone(passthrough);
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

function updateTimeZone(params) {
	http.request({
		method : "patient_preferences_update",
		params : {
			feature_code : "THXXX",
			data : [{
				patients : {
					preferences : {
						pref_timezone : params.timeZone
					}
				}
			}]
		},
		passthrough : params,
		forceRetry : true,
		success : didUpdatePreferences
	});
}

function didUpdatePreferences(result, passthrough) {
	/**
	 * updating local model
	 * after successful api response
	 */
	Alloy.Models.patient.set("pref_timezone", passthrough.timeZone);
	setTimeZone(Alloy.Models.patient.get("pref_timezone"));
	if (passthrough.success) {
		passthrough.success();
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

function logout(options) {
	if (Alloy.Globals.isLoggedIn) {
		http.request({
			method : "patient_logout",
			params : {
				feature_code : "THXXX"
			},
			passthrough : options || {},
			errorDialogEnabled : false,
			success : didLogout,
			failure : didLogout
		});
	} else if (options.success) {
		options.success();
	}
}

function didLogout(result, passthrough) {
	/**
	 * on explicit log out /
	 * session timeout
	 * update this flag,
	 * so user will be taken to
	 * login screen
	 */
	if (passthrough.explicit !== false) {
		utilities.setProperty(Alloy.CFG.lastest_logout_explicit, true, "bool", false);
	}
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
	/**
	 * success callback
	 * if any
	 */
	if (passthrough.success) {
		passthrough.success();
	} else {
		app.navigator.open(Alloy.Collections.menuItems.findWhere({
			landing_page : true
		}).toJSON());
		/**
		 * show logout dialog
		 * only if dialogEnabled is true
		 * examples:
		 * 1. in case if user clicks on logout
		 * (a explicit logout) then show this dialog
		 * dialogEnabled should be set to true
		 * 2. in case of session timeout we don't
		 * show this logout dialog here
		 */
		if (passthrough.dialogEnabled) {
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
