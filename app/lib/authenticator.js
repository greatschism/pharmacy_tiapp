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

function init(passthrough) {
	if (!passthrough) {
		passthrough = {};
	}
	/**
	 * by default
	 * errorDialogEnabled will be false
	 */
	passthrough.errorDialogEnabled = false;
	/**
	 * check username
	 * and password
	 */
	var username = passthrough.username,
	    password = passthrough.password;
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
		 * when passthrough has a valid username
		 * and password properties
		 */
		passthrough.errorDialogEnabled = true;
	} else if (getAutoLoginEnabled() && !utilities.getProperty(Alloy.CFG.lastest_logout_explicit, false, "bool", false)) {
		username = encryptionUtil.decrypt(keychain.account);
		password = encryptionUtil.decrypt(keychain.valueData);
	}
	/**
	 * happens when auto login is turned on
	 * but there was a explicit logout or session timeout
	 */
	if (!username || !password) {
		didFail({}, passthrough);
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
		passthrough : passthrough,
		keepLoader : true,
		errorDialogEnabled : passthrough.errorDialogEnabled,
		success : didAuthenticate,
		failure : didFail
	});
}

function didFail(error, passthrough) {
	/**
	 * hide loader is called here
	 * as keepLoader is set true here
	 * for simultaneous api calls
	 * with failure callback
	 */
	app.navigator.hideLoader();
	/**
	 * keep silent as there will not be any patient switcher
	 * before successful authenticate
	 */
	Alloy.Collections.patients.reset([], {
		silent : true
	});
	delete Alloy.Globals.sessionId;
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
	Alloy.Globals.sessionId = result.data.patients.session_id;
	/**
	 * code values check
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
				}, {
					code_name : Alloy.CFG.apiCodes.code_relationship
				}]
			}]
		},
		passthrough : passthrough,
		keepLoader : true,
		errorDialogEnabled : passthrough.errorDialogEnabled,
		success : didGetCodeValues,
		failure : didFail
	});
}

function didGetCodeValues(result, passthrough) {
	Alloy.Models.language.set(result.data.codes[0]);
	Alloy.Models.timeZone.set(result.data.codes[1]);
	Alloy.Models.relationship.set(result.data.codes[2]);
	appendFlag(Alloy.Models.language.get("code_values"), localization.currentLanguage.code);
	appendFlag(Alloy.Models.relationship.get("code_values"), Alloy.Models.relationship.get("default_value"));
	//now get family accounts
	getFamilyAccounts(passthrough);
}

function getFamilyAccounts(passthrough) {
	/**
	 * currentPatientIndex is used with get patient
	 * we are just initiating it here
	 */
	//start from 0 - manager account
	if (_.isUndefined(passthrough.currentPatientIndex)) {
		passthrough.currentPatientIndex = 0;
		/**
		 * requried when this is a external
		 * call and not part of authenticate
		 * during authenticate at this point
		 * Alloy.Collections.patients.length will be 0
		 * and Alloy.Globals.sessionId is already pointed to manager account
		 */
		if (Alloy.Collections.patients.length) {
			Alloy.Globals.sessionId = Alloy.Collections.patients.at(passthrough.currentPatientIndex).get("session_id");
		}
	}
	http.request({
		method : "patient_family_get",
		params : {
			feature_code : "THXXX"
		},
		passthrough : passthrough,
		keepLoader : true,
		errorDialogEnabled : passthrough.errorDialogEnabled,
		success : didGetFamilyAccounts,
		failure : didFail
	});
}

function didGetFamilyAccounts(result, passthrough) {
	var patient = result.data,
	    relationships = Alloy.Models.relationship.get("code_values"),
	    patients = [];
	//manager account
	patients.push(_.extend(patient, {
		session_id : Alloy.Globals.sessionId,
		related_by : Alloy.CFG.apiCodes.relationship_manager,
		relationship : Alloy.Globals.strings.strManager,
		selectable : true,
		selected : true
	}));
	_.each(patient.child_proxy, function(child) {
		/**
		 * if child_id is null
		 * then don't add it
		 * Note: child_id is only generated
		 * when user has accepted the invitation
		 * when child_id is null, link_id
		 * will be present in the object
		 */
		if (!child.child_id) {
			return false;
		}
		/**
		 * Note: With family care module
		 * if related_by is chosen as
		 * others, then client app makes
		 * a way to user to enter his own
		 * value and that value is being
		 * passed to server. So it might not match
		 * with any code_value / code_display
		 */
		var childRelationship = _.findWhere(relationships, {
			code_value : child.related_by
		});
		patients.push(_.extend(_.pick(child, ["address", "child_id", "link_id", "related_by", "session_id"]), {
			relationship : childRelationship ? childRelationship.code_display : child.related_by,
			selectable : true,
			selected : false
		}));
	});
	/**
	 * update patients collection
	 * keep silent, so let the patient switcher
	 * not be updated at this moment
	 */
	Alloy.Collections.patients.reset(patients, {
		silent : true
	});
	//get patient for all patients starting from 0 - manager
	getPatient(passthrough);
}

function getPatient(passthrough) {
	http.request({
		method : "patient_get",
		params : {
			feature_code : "THXXX"
		},
		passthrough : passthrough,
		keepLoader : true,
		errorDialogEnabled : passthrough.errorDialogEnabled,
		success : didGetPatient,
		failure : didFail
	});
}

function didGetPatient(result, passthrough) {
	var patient = result.data.patients;
	/**
	 * Note: manager account can be partial
	 * but child accounts can't be a partial account
	 * as per inputs from Server Team, for partial accounts
	 * id will start with DUMMY
	 */
	_.extend(patient, {
		first_name : utilities.ucfirst(patient.first_name),
		last_name : utilities.ucfirst(patient.last_name),
		is_adult : moment().diff(moment(patient.birth_date, Alloy.CFG.apiCodes.dob_format), "years", true) >= 18,
		is_partial : (patient.patient_id || "").indexOf("DUMMY") !== -1
	});
	patient.title = patient.first_name + " " + patient.last_name;
	Alloy.Collections.patients.at(passthrough.currentPatientIndex).set(patient);
	//get preferences
	http.request({
		method : "patient_preferences_get",
		params : {
			feature_code : "THXXX"
		},
		passthrough : passthrough,
		keepLoader : true,
		errorDialogEnabled : passthrough.errorDialogEnabled,
		success : didGetPreferences,
		failure : didFail
	});
}

function didGetPreferences(result, passthrough) {
	Alloy.Collections.patients.at(passthrough.currentPatientIndex).set(result.data.patients.preferences);
	//get next patient information
	passthrough.currentPatientIndex++;
	//check whether next index is available
	if (passthrough.currentPatientIndex < Alloy.Collections.patients.length) {
		//update session id
		Alloy.Globals.sessionId = Alloy.Collections.patients.at(passthrough.currentPatientIndex).get("session_id");
		//get patient
		getPatient(passthrough);
	} else {
		//delete the property added - currentPatientIndex
		delete passthrough.currentPatientIndex;
		//hide loader
		app.navigator.hideLoader();
		/**
		 * variable used
		 * with XML - if
		 * for validating whether user
		 * has linked any account to his account
		 * even though if it is on pending state
		 * Note: by default patients length will be 1
		 * with manager account object
		 */
		Alloy.Globals.hasChildProxies = (Alloy.Collections.patients.at(0).get("child_proxy") || []).length > 0;
		/**
		 * variable used
		 * with XML - if
		 * for validating whether user
		 * has child accounts
		 * Note: by default patients length will be 1
		 * with manager account object
		 */
		Alloy.Globals.hasPatientSwitcher = Alloy.Collections.patients.length > 1;
		//manager model
		var mPatient = Alloy.Collections.patients.at(0);
		/**
		 * revert the session id
		 * if any
		 */
		if (passthrough.revert) {
			/**
			 * if valid, then select it
			 * if not valid, keep the manager account session id
			 * the selected flag would have set already during
			 * family get
			 */
			var toSelect = Alloy.Collections.patients.findWhere({
				child_id : passthrough.revert
			});
			if (toSelect) {
				//valid, unselect manager
				mPatient.set("selected", false);
				toSelect.set("selected", true);
				Alloy.Globals.sessionId = toSelect.get("session_id");
			} else {
				//not valid, just point to manager session id which is already selected
				Alloy.Globals.sessionId = mPatient.get("session_id");
			}
		} else {
			//no revert is passed, just point to manager session id which is already selected
			Alloy.Globals.sessionId = mPatient.get("session_id");
		}
		/**
		 * fire callback
		 * if any - occurs when
		 * this is not part of authenticate
		 * but a external patient get
		 */
		if (passthrough.callback) {
			//trigger reset for patient switcher
			Alloy.Collections.patients.trigger("reset");
			//fire callback
			var callback = passthrough.callback;
			delete passthrough.callback;
			if (callback) {
				callback(passthrough);
			}
		} else {
			/**
			 * now isLoggedIn flag can be set
			 * as there is no way to go back without logout
			 * api now
			 */
			Alloy.Globals.isLoggedIn = true;
			//update default time zone
			appendFlag(Alloy.Models.timeZone.get("code_values"), mPatient.get("pref_timezone"));
			/**
			 * set prefered time zone
			 * before that store the user
			 * device time to validate whether
			 * there is a mismatch
			 */
			var dateObj = new Date(Alloy.CFG.default_date),
			    dFormat = Alloy.CFG.date_time_format,
			    dDate = moment(dateObj).format(dFormat),
			    currentTZ;
			setTimeZone(mPatient.get("pref_timezone"));
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
						currentTZ = code.code_value;
						return true;
					}
					return false;
				});
				if (currentTZ) {
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
							passthrough.params = {
								pref_timezone : currentTZ
							};
							updatePreferences(passthrough);
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
	}
}

function updatePreferences(passthrough) {
	/**
	 * api requires all parameters to be sent
	 */
	var preferences = Alloy.Collections.patients.findWhere({
		selected : true
	}).pick(["doctor_appointment_reminder_flag", "med_reminder_flag", "app_reminder_flag", "onphone_reminder_duration_in_days", "rx_refill_duration_in_days", "refill_reminder_flag", "show_rx_names_flag", "pref_timezone", "pref_language", "pref_prescription_sort_order", "hide_expired_prescriptions", "hide_zero_refill_prescriptions", "doctor_reminder_dlvry_mode", "med_reminder_dlvry_mode", "app_reminder_dlvry_mode", "refill_reminder_dlvry_mode", "health_info_reminder_dlvry_mode", "promotion_deals_reminder_mode"]);
	//extend updated values
	_.extend(preferences, passthrough.params);
	http.request({
		method : "patient_preferences_update",
		params : {
			feature_code : "THXXX",
			data : [preferences]
		},
		passthrough : passthrough,
		forceRetry : true,
		success : didUpdatePreferences
	});
}

function didUpdatePreferences(result, passthrough) {
	/**
	 * updating local model and moment
	 * if required
	 */
	var sModel = Alloy.Collections.patients.findWhere({
		selected : true
	}),
	    params = passthrough.params;
	/**
	 * if manager & pref_timezone
	 * then call setTimeZone
	 * to update local time zone
	 */
	if (params.pref_timezone && sModel.get("related_by") === Alloy.CFG.apiCodes.relationship_manager) {
		setTimeZone(params.pref_timezone, true);
	}
	sModel.set(params);
	var callback = passthrough.success || passthrough.callback;
	if (callback) {
		callback();
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

function logout(passthrough) {/**
	 * logout all patients
	 * linked to this account
	 */
	if (!passthrough) {
		passthrough = {};
	}
	if (Alloy.Globals.isLoggedIn) {
		//start from 0 - manager account
		if (_.isUndefined(passthrough.currentPatientIndex)) {
			passthrough.currentPatientIndex = 0;
			Alloy.Globals.sessionId = Alloy.Collections.patients.at(passthrough.currentPatientIndex).get("session_id");
		}
		doLogout(passthrough);
	} else if (passthrough.success) {
		passthrough.success();
	}
}

function doLogout(passthrough) {
	http.request({
		method : "patient_logout",
		params : {
			feature_code : "THXXX"
		},
		passthrough : passthrough,
		keepLoader : true,
		errorDialogEnabled : false,
		success : didLogout,
		failure : didLogout
	});
}

function didLogout(result, passthrough) {
	//get next patient information
	passthrough.currentPatientIndex++;
	//check whether next index is available
	if (passthrough.currentPatientIndex < Alloy.Collections.patients.length) {
		//update session id
		Alloy.Globals.sessionId = Alloy.Collections.patients.at(passthrough.currentPatientIndex).get("session_id");
		//logout patient
		doLogout(passthrough);
	} else {
		//delete the property added - currentPatientIndex
		delete passthrough.currentPatientIndex;
		//hide loader
		app.navigator.hideLoader();
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
		 * reset global variables
		 */
		_.each(["sessionId", "isLoggedIn", "hasChildProxies", "hasPatientSwitcher"], function(value) {
			delete Alloy.Globals[value];
		});
		/**
		 * reset collections and models
		 */
		var igoreKeys = ["menuItems", "banners", "appload", "template"];
		_.each(Alloy.Collections, function(coll, key) {
			if (_.isFunction(coll.reset) && _.indexOf(igoreKeys, key) === -1) {
				/**
				 * keep it silent to prevent updated events now
				 * any way all views are going to be destroyed after logout
				 */
				coll.reset([], {
					silent : true
				});
			}
		});
		_.each(Alloy.Models, function(model, key) {
			if (_.isFunction(model.clear) && _.indexOf(igoreKeys, key) === -1) {
				model.clear();
			}
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

function setTimeZone(zone, updateCodeVal) {
	/**
	 * update code values
	 * if updateCodeVal is true
	 * need to update updateCodeVal
	 * only when this is a preference update
	 * during time zone check
	 */
	if (updateCodeVal) {
		appendFlag(Alloy.Models.timeZone.get("code_values"), zone);
	}
	/**
	 * update moment
	 */
	moment.tz.setDefault(zone);
	/**
	 * update the last request time
	 * as the time zone is updated now
	 */
	Alloy.Globals.latestRequest = moment().unix();
}

/**
 * update family account (patients) collection
 * with get/family api
 * @param {Functions} callback
 */
function updateFamilyAccounts(callback) {
	getFamilyAccounts({
		revert : Alloy.Collections.patients.findWhere({
			selected : true
		}).get("child_id"),
		callback : callback
	});
}

exports.init = init;
exports.logout = logout;
exports.getData = getData;
exports.setTimeZone = setTimeZone;
exports.updatePreferences = updatePreferences;
exports.setAutoLoginEnabled = setAutoLoginEnabled;
exports.getAutoLoginEnabled = getAutoLoginEnabled;
exports.updateFamilyAccounts = updateFamilyAccounts;
