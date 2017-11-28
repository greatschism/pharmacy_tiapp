var TAG = "AUTH",
    Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    moment = require("alloy/moment"),
    app = require("core"),
    utilities = require("utilities"),
    uihelper = require("uihelper"),
    encryptionUtil = require("encryptionUtil"),
    http = require("requestwrapper"),
    localization = require("localization"),
    feedbackHandler = require("feedbackHandler"),
    notificationHandler = require("notificationHandler"),
    crashreporter = require("crashreporter"),
    keychain = require("com.obscure.keychain").createKeychainItem(Alloy.CFG.user_account),
    analyticsHandler = require("analyticsHandler"),
    logger = require("logger"),
	touchID = require("touchid"),
    v6keychain = OS_ANDROID ? require('com.mscripts.androidkeychain') : require("com.mscripts.keychainimporter");

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
	 * on first app launch check for v6 credentials
	 */
	if (utilities.getProperty(Alloy.CFG.first_launch_app, true, "bool", false)) {
		if (OS_ANDROID) {
			var v6Password = v6keychain.retrieveSharedPreferences("password") == null ? "" : v6keychain.retrieveSharedPreferences("password");
			var v6Username = v6keychain.retrieveSharedPreferences("username") == null ? "" : v6keychain.retrieveSharedPreferences("username");
			if (v6Username !== "" && v6Password !== "") {
				passthrough.username = v6Username;
				passthrough.password = v6Password;
				setAutoLoginEnabled(true);
				/**
				 * 	update previous values to empty string
				 */
				v6keychain.storeSharedPreferences("username", "");
				v6keychain.storeSharedPreferences("password", "");
			}
		} else {
			var autologinFlag = v6keychain.getAutologinFlag({
				serviceName : Alloy.CFG.v6_service_name
			}),
			    keydump = v6keychain.obatainV6KeychainDictWithServiceName({
				serviceName : Alloy.CFG.v6_service_name
			}),
			    v6Password = keydump.passwordKey,
			    v6Username = keydump.usernameKey;
			if (autologinFlag && v6Username !== "" && v6Password !== "") {

 				//This detects if this instance of the v7 app was installed directly OVER a v6 installation
 				//If there was simply keychain data left over from a previous v6 installation (which had subsequently been deleted)
 				//then this will prevent the data from being used.
				var savedV6File= Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, "logincount");

				if (savedV6File.exists()) {
					passthrough.username = v6Username;
					passthrough.password = v6Password;
					setAutoLoginEnabled(true);
    			}
					
				/**
				 * 	update previous values to empty string
				 */
				v6keychain.flushV6Keychain({
					serviceName : Alloy.CFG.v6_service_name
				});
			}
		}
		utilities.setProperty(Alloy.CFG.first_launch_app, false, "bool", false);
	};

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
		// passthrough.errorDialogEnabled = true;
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
	Alloy.Globals.isAccountUpgraded = false;
	http.request({
		method : "patient_authenticate",
		params : {
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
	//reset authentication data
	resetAuthenticationData();
	/**
	 * hide loader is called here
	 * as keepLoader is set true here
	 * for simultaneous api calls
	 * with failure callback
	 */
	app.navigator.hideLoader();
	//fire failure if any
	if (passthrough.loginFailure) {
		passthrough.loginFailure(error, passthrough);
	}
	else if (passthrough.failure) {
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
	passthrough.loginResult = result;
	passthrough.keychain = keychain;
	passthrough.logout = doLogout;
	Alloy.Globals.sessionId = result.data.patients.session_id;
	
	if (result.data.patients.is_minor === "0" && result.data.patients.is_account_upgrade_req === "1") {
		app.navigator.hideLoader();
		/**
		 * navigate to loginInfoUpdate screen
		 */
		passthrough.checkCodeValues = checkCodeValues;
		passthrough.title = Alloy.Globals.strings.loginInfoUpdateTitle;
		if (passthrough.force_start) {
			doLogout(passthrough);
		} else {
			app.navigator.open({
	 			ctrl : "loginInfoUpdate",
	 			titleid : "loginInfoUpdateTitle",
	 			ctrlArguments : passthrough,
	 			stack : true
	 		});
		}
	} else if (result.data.patients.is_minor === "1" && result.data.patients.is_account_upgrade_req === "1") {
		app.navigator.hideLoader();
		/**
		 * navigate to mgrAccountUpdate screen if coming from login screen
		 */
		if (passthrough.force_start) {
			doLogout(passthrough);
		} else {
			app.navigator.open({
	 			ctrl : "mgrAccountUpdate",
	 			titleid : "mgrAccountUpdateTitle",
	 			ctrlArguments : passthrough,
	 			stack : true
	 		});			
		};
	} else {
		/**
		 * code values check
		 */
		checkCodeValues(passthrough);
	}
}

function checkCodeValues(passthrough) {
	http.request({
		method : "codes_get",
		params : {
			data : [{
				codes : [{
					code_name : Alloy.CFG.apiCodes.code_language
				}, {
					code_name : Alloy.CFG.apiCodes.code_time_zone
				}, {
					code_name : Alloy.CFG.apiCodes.code_relationship
				}, {
					code_name : Alloy.CFG.apiCodes.code_sort_order_preference
				}, {
					code_name : Alloy.CFG.apiCodes.code_counseling_eligible
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
	Alloy.Models.sortOrderPreferences.set(result.data.codes[3]);
	Alloy.Models.counselingEligible.set(result.data.codes[4]);
	
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
	/**
	 * when it is a explicit call (from other controller, not part of authenticate)
	 * assign the failure callback directly if any, so user will not be logged out
	 * but the failure callback should handle for hiding loader window since
	 * keepLoader is true, will be auto hidden if no callback is passed in such cases
	 */
	http.request({
		method : "patient_family_get",
		passthrough : passthrough,
		keepLoader : true,
		errorDialogEnabled : passthrough.errorDialogEnabled,
		success : didGetFamilyAccounts,
		failure : passthrough.explicit ? passthrough.failure : didFail
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
		relationship : Alloy.Globals.strings.strRelationshipManager,
		selectable : true,
		selected : true
	}));
	_.each(patient.child_proxy, function(child) {
		/**
		 * check for the status of the child
		 * append to patients only if it linked
		 * ignore if declined / pending
		 */
		if (child.status !== Alloy.CFG.apiCodes.family_account_status_linked) {
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
		patients.push(_.extend(_.pick(child, ["child_id", "related_by", "address", "linked_date", "session_id"]), {
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
		passthrough : passthrough,
		keepLoader : true,
		errorDialogEnabled : passthrough.errorDialogEnabled,
		success : didGetPatient,
		failure : passthrough.explicit ? passthrough.failure : didFail
	});
}

function didGetPatient(result, passthrough) {
	var patientModel = Alloy.Collections.patients.at(passthrough.currentPatientIndex),
	    patient = result.data.patients;
	/**
	 * Note: manager account can be partial
	 * but child accounts can't be a partial account
	 * as per inputs from Server Team, for partial accounts
	 * id will start with DUMMY
	 *
	 * for pet: is_adult can always be false
	 *
	 * for minor accounts: when child turns 18
	 * is_adult will be true. Based on the linked_date
	 * client app will get to know whether the adult was
	 * linked when he was minor. Then invite flag
	 * is set to true, so the patient switcher
	 * will throw an invite dialog upon selection.
	 *
	 * checking for valid linked_date as manager account
	 * won't have one
	 */
	var mDob = moment(patient.birth_date, Alloy.CFG.apiCodes.dob_format),
	    isAdult = patientModel.get("related_by") != Alloy.CFG.apiCodes.relationship_pet && moment().diff(mDob, "years", true) >= 18,
	    linkedDate = patientModel.get("linked_date"),
	    shouldInvite = false;
	if (linkedDate && isAdult) {
		/**
		 * if adult was a minor
		 * during linked_date then it confirms
		 * he should be invited again
		 */
		shouldInvite = moment(linkedDate, Alloy.CFG.apiCodes.date_format).diff(mDob, "years", true) < 18;
		/**
		 * update the same invite flag under
		 * child_proxy property of manager account model
		 * so can be reused in family care
		 *
		 * Just avoid a loop for setting false value
		 * by checking if shouldInvite == true
		 */
		if (shouldInvite) {
			_.findWhere(Alloy.Collections.patients.at(0).get("child_proxy"), {
				child_id : patientModel.get("child_id")
			}).should_invite = true;
		}
	}
	_.extend(patient, {
		first_name : utilities.ucfirst(patient.first_name),
		last_name : utilities.ucfirst(patient.last_name),
		is_adult : isAdult,
		should_invite : shouldInvite,
		is_partial : (patient.patient_id || "").indexOf("DUMMY") !== -1
	});
	patient.title = patient.first_name + " " + patient.last_name;
	patientModel.set(patient);
	//get preferences
	http.request({
		method : "patient_preferences_get",
		passthrough : passthrough,
		keepLoader : true,
		errorDialogEnabled : passthrough.errorDialogEnabled,
		success : didGetPreferences,
		failure : passthrough.explicit ? passthrough.failure : didFail
	});
}

function didGetPreferences(result, passthrough) {


	 Ti.API.info("Patient PREFS!!!");
	
	 Ti.API.info(JSON.stringify(result));
	 Ti.API.info("Patient PREFS ^^^^^^ !!!");

	//if there is CC info for this user.
	//TODO: this should detect for the node, not just the existance of the string in the response
	//I'm uncertain how this applies to potential linked family memebers.  Can we confirm this conditional will only ever execute for the 'main'
	//user? (ie does the preferences/get API only fire for the user who is logged in as opposed to any family memebers?)
	if( JSON.stringify(result).indexOf("card_type") !== -1 ) {
		//set flag that the user has been prompted
	    Ti.API.info("setProperty(Alloy.CFG.checkout_info_prompted, true    !!!");
		utilities.setProperty(Alloy.CFG.checkout_info_prompted, true, "bool", false);
		utilities.setProperty(Alloy.CFG.cc_on_file, true, "bool", false);
	}

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
		/**
		 * variable used
		 * with XML - if
		 * for validating whether user
		 * has any parent proxies
		 * can be at any state
		 */
		Alloy.Globals.hasParentProxies = (Alloy.Collections.patients.at(0).get("parent_proxy") || []).length > 0;
		/**
		 * variable used
		 * with XML - if
		 * for validating whether user
		 * has any child proxies
		 * can be at any state
		 */
		Alloy.Globals.hasChildProxies = (Alloy.Collections.patients.at(0).get("child_proxy") || []).length > 0;
		/**
		 * variable used
		 * with XML - if
		 * for validating whether user
		 * has child or parent proxy
		 */
		Alloy.Globals.hasProxies = Alloy.Globals.hasParentProxies || Alloy.Globals.hasChildProxies;
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
		if (passthrough.child_id) {
			/**
			 * if valid, then select it
			 * if not valid, keep the manager account session id
			 * the selected flag would have set already during
			 * family get
			 */
			var toSelect = Alloy.Collections.patients.findWhere({
				child_id : passthrough.child_id
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
		 * check whether this is a
		 * explicit request from other
		 * controllers just because of
		 * a change in family care
		 * i.e account add / delete / update
		 * Note: checking just for callback
		 * will fail when no callback is passed
		 * to updateFamilyAccounts. So
		 * we need explicit property
		 */
		if (passthrough.explicit) {
			//unset flag
			delete passthrough.explicit;
			//hide loader
			app.navigator.hideLoader();
			//trigger reset for patient switcher
			Alloy.Collections.patients.trigger("reset");
			/**
			 * fire callback
			 * if any
			 */
			if (passthrough.success) {
				passthrough.success();
			}
		} else {
			/**
			 * first verify if user has enabled push notification,
			 * if then verify the device token too
			 */
			if (_.some(_.pluck(Alloy.CFG.reminders, "col_pref"), function(val) {
				/**
				 * it can be invalid push mode if current platform
				 * is different form previous one
				 */
				var deliveryMode = mPatient.get(val);
				return deliveryMode === Alloy.CFG.apiCodes.reminder_delivery_mode_push || deliveryMode === Alloy.CFG.apiCodes.reminder_delivery_mode_push_invalid;
			})) {
				setDefaultDeviceForManager(passthrough);
			} else {
				//if push is not enabled, then move further
				initiateTimeZoneCheck(passthrough);
			}
		}
	}
}

function setDefaultDeviceForManager(passthrough) {
	//if push is enabled then verify device token
	notificationHandler.init(function didReady(deviceToken) {
		if (deviceToken) {
			/**
			 * ask user if he wants to update device token,
			 * receive push notifications on this new device
			 */
			var oldDeviceToken = Alloy.Collections.patients.at(0).get("device_token");
			//if no device is set already, proceed without alert
			if (!oldDeviceToken) {
				setDefaultDeviceForManagerApi(passthrough);
			} else if (oldDeviceToken !== deviceToken) {
				//hide loader
				app.navigator.hideLoader();
				//prompt
				uihelper.showDialog({
					message : Alloy.Globals.strings.msgUpdateDeviceConfirm,
					buttonNames : [Alloy.Globals.strings.dialogBtnYes, Alloy.Globals.strings.dialogBtnNo],
					cancelIndex : 1,
					success : function didConfirmDevice() {
						setDefaultDeviceForManagerApi(passthrough);
					},
					cancel : function didNotConfirmDevice() {
						initiateTimeZoneCheck(passthrough);
					}
				});
			} else {
				initiateTimeZoneCheck(passthrough);
			}
		} else {
			//hide loader
			app.navigator.hideLoader();
			//prompt
			uihelper.showDialog({
				message : Alloy.Globals.strings.msgPushNotificationsAuthorizationDenied,
				buttonNames : [Alloy.Globals.strings.dialogBtnRetry, Alloy.Globals.strings.dialogBtnContinue],
				cancelIndex : 1,
				success : function didConfirmDevice() {
					setDefaultDeviceForManager(passthrough);
				},
				cancel : function didNotConfirmDevice() {
					initiateTimeZoneCheck(passthrough);
				}
			});
		}
	});
}

function setDefaultDeviceForManagerApi(passthrough) {
	http.request({
		method : "patient_default_device",
		params : {
			data : [{
				device : {
					deviceType : Ti.Platform.osname,
					deviceId : notificationHandler.deviceToken
				}
			}]
		},
		passthrough : passthrough,
		keepLoader : true,
		errorDialogEnabled : passthrough.errorDialogEnabled,
		success : didSetDefaultDeviceForManager,
		failure : didFail
	});
}

function didSetDefaultDeviceForManager(result, passthrough) {
	var mPatient = Alloy.Collections.patients.at(0);
	//update local cache
	mPatient.set("device_token", notificationHandler.deviceToken);
	/**
	 * check whether any of the reminder mode
	 * is invalid to the current platform,
	 * if then update it to valid one, as set
	 * default device is success
	 */
	var preferences = {};
	_.each(_.pluck(Alloy.CFG.reminders, "col_pref"), function(val) {
		if (mPatient.get(val) === Alloy.CFG.apiCodes.reminder_delivery_mode_push_invalid) {
			preferences[val] = Alloy.CFG.apiCodes.reminder_delivery_mode_push;
		}
	});
	/**
	 * to reduce the number of api calls to
	 * update preferences, storing it in params
	 * for now
	 */
	passthrough.preferences = preferences;
	initiateTimeZoneCheck(passthrough);
}

function initiateTimeZoneCheck(passthrough) {
	/**
	 * manager account
	 */
	var mPatient = Alloy.Collections.patients.at(0);
	/**
	 * update default sort preferences
	 */
	appendFlag(Alloy.Models.sortOrderPreferences.get("code_values"), mPatient.get("pref_prescription_sort_order"));
	/**
	 * set prefered time zone
	 * before that store the user
	 * device time to validate whether
	 * there is a mismatch
	 */
	var dateObj = Alloy.CFG.default_date,
	    dFormat = Alloy.CFG.date_time_format,
	    dDate = moment(dateObj).format(dFormat),
	    currentTZ;
	setTimeZone(mPatient.get("pref_timezone"), true);
	/**
	 * callback
	 */
	var shouldUpdatePreferences = function(newPref) {
		var extPref = _.extend(passthrough.preferences || {}, newPref);
		if (_.isEmpty(extPref)) {
			//hide loader
			app.navigator.hideLoader();
			//no need for any preferences update
			completeAuthentication(passthrough);
		} else {
			/**
			 * let update preferences method know
			 * this is not a external call
			 * so it will pickup the right failure
			 * callback
			 */
			passthrough.explicit = false;
			//update preferences
			updatePreferences(extPref, passthrough);
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
		//hide loader
		app.navigator.hideLoader();
		//alert for time zone
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
					shouldUpdatePreferences({
						pref_timezone : currentTZ
					});
				},
				cancel : shouldUpdatePreferences
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
				cancel : shouldUpdatePreferences
			});
		}
	} else {
		shouldUpdatePreferences();
	}
}

function updatePreferences(params, passthrough) {
	/**
	 * api requires all parameters to be sent
	 */
	var isTextActive = false,
	    isPushEnabled = false,
	    sModel = Alloy.Collections.patients.findWhere({
		selected : true
	}),
	    preferences = sModel.pick(["doctor_appointment_reminder_flag", "med_reminder_flag", "app_reminder_flag", "onphone_reminder_duration_in_days", "rx_refill_duration_in_days", "refill_reminder_flag", "show_rx_names_flag", "pref_timezone", "pref_language", "pref_prescription_sort_order", "hide_expired_prescriptions", "hide_zero_refill_prescriptions", "email_msg_active", "doctor_reminder_dlvry_mode", "med_reminder_dlvry_mode", "app_reminder_dlvry_mode", "refill_reminder_dlvry_mode", "health_info_reminder_dlvry_mode", "promotion_deals_reminder_mode"]);
	//update flags used by reminder jobs - PHA-1584
	_.each(Alloy.CFG.reminders, function(reminder, index) {
		/**
		 * pickup delivery mode from given settings,
		 * if not available there from existing preferecnes
		 */
		var deliveryMode = _.has(params, reminder.col_pref) ? params[reminder.col_pref] : preferences[reminder.col_pref];
		/**
		 * only 4 of 6 reminder types are supported by back-end.
		 * only those 4 has flags used by jobs
		 */
		if (_.has(reminder, "flg_pref")) {
			/**
			 * when delivery mode is null (reminder_delivery_mode_none), reminder flag should "0"
			 * otherwise "1"
			 */
			if (deliveryMode === Alloy.CFG.apiCodes.reminder_delivery_mode_none && preferences[reminder.flg_pref] === "1") {
				params[reminder.flg_pref] = "0";
			} else if (deliveryMode !== Alloy.CFG.apiCodes.reminder_delivery_mode_none && preferences[reminder.flg_pref] === "0") {
				params[reminder.flg_pref] = "1";
			}
		}
		//PHA-1791
		if (deliveryMode === Alloy.CFG.apiCodes.reminder_delivery_mode_text) {
			isTextActive = true;
		}
		/**
		 * verify device token only if the update
		 * request has the push mode enabled for
		 * any of the reminder
		 */
		if (params[reminder.col_pref] === Alloy.CFG.apiCodes.reminder_delivery_mode_push || params[reminder.col_pref] === Alloy.CFG.apiCodes.reminder_delivery_mode_push_invalid) {
			/**
			 * it can be invalid push mode if current platform
			 * is different form previous one
			 */
			isPushEnabled = true;
		}
	});
	//PHA-1791
	params.text_msg_active = isTextActive ? "1" : "0";
	//extend updated values
	_.extend(preferences, params);
	//extend passthrough for params
	_.extend(passthrough, {
		params : params,
		preferences : preferences
	});
	/**
	 * verify whether server has right device token
	 * only when this is a external call, when internal
	 * it would have been checked for manager account
	 * before time zone check
	 */
	if (passthrough.explicit !== false && isPushEnabled) {
		setDefaultDevice(passthrough);
	} else {
		updatePreferencesApi(passthrough);
	}
}

function updatePreferencesApi(passthrough) {
	var preferences = passthrough.preferences;
	delete passthrough.preferences;
	//api call
	http.request({
		method : "patient_preferences_update",
		params : {
			data : [preferences]
		},
		passthrough : passthrough,
		errorDialogEnabled : passthrough.errorDialogEnabled,
		success : didUpdatePreferences,
		failure : passthrough.explicit !== false ? passthrough.failure : didFail
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
	//unset params
	delete passthrough.params;
	/**
	 * when explicit is false
	 * then this is a internal request
	 * within authenticator
	 */
	if (passthrough.explicit !== false) {
		//explict callback
		if (passthrough.success) {
			passthrough.success();
		}
	} else {
		//unset flag
		delete passthrough.explicit;
		//complete authentication
		completeAuthentication(passthrough);
	}
}

function completeAuthentication(passthrough) {
	/**
	 * now isLoggedIn flag can be set
	 * as there is no way to go back without logout
	 * api now
	 */
	Alloy.Globals.isLoggedIn = true;
	/**
	 * add logout menu item
	 */
	Alloy.Collections.menuItems.add({
		titleid : "titleLogout",
		action : "logout",
		icon : "logout"
	});
	//track new session
	analyticsHandler.startSession();
	/**
	 * update crash reporter
	 * with user username
	 */
	crashreporter.setUsername(Alloy.Collections.patients.at(0).get("email_address"));
	//update feedback counter
	feedbackHandler.updateCounter(Alloy.CFG.apiCodes.feedback_action_login);
	
	/**
	 * check for mandatory screens
	 * to be visited after successful login
	 * i.e HIPAA or email verification etc.,
	 * if none, pass false to the success callback
	 * so the callback will initiate a navigation
	 * i.e a module if user initiated login screen
	 * from hamburger or landing page
	 */
	var navigationHandled = hasMandatoryNavigation();
	if (passthrough.success) {
		passthrough.success(passthrough, navigationHandled);	
	}
}

function isExpressCheckoutValid(exp_counter_key) {
	var exp_counter_time = utilities.getProperty(exp_counter_key, null, "object", false);
	if (exp_counter_time) {
		var timeThen = exp_counter_time;
		var now = moment();
		if (now.diff(timeThen, 'hours') >= 24) {
			//	reset counter if more than 24 hours
			utilities.removeProperty(exp_counter_key);
		} else {
			return true;
		}
	}
	return false;
}

function setDefaultDevice(passthrough) {
	notificationHandler.init(function didReady(deviceToken) {
		if (deviceToken) {
			/**
			 * ask user if he wants to update device token,
			 * receive push notifications on this new device
			 * Note: here device_token verified for current patient,
			 * while login it is only for manager account
			 */
			var oldDeviceToken = Alloy.Collections.patients.findWhere({
				selected : true
			}).get("device_token");
			//if no device is set already, proceed without alert
			if (!oldDeviceToken) {
				setDefaultDeviceApi(passthrough);
			} else if (oldDeviceToken !== deviceToken) {
				//prompt now
				uihelper.showDialog({
					message : Alloy.Globals.strings.msgUpdateDeviceConfirm,
					buttonNames : [Alloy.Globals.strings.dialogBtnYes, Alloy.Globals.strings.dialogBtnNo],
					cancelIndex : 1,
					success : function didConfirmDevice() {
						setDefaultDeviceApi(passthrough);
					},
					cancel : function didNotConfirmDevice() {
						updatePreferencesApi(passthrough);
					}
				});
			} else {
				updatePreferencesApi(passthrough);
			}
		} else {
			uihelper.showDialog({
				message : Alloy.Globals.strings.msgPushNotificationsAuthorizationDenied,
				buttonNames : [Alloy.Globals.strings.dialogBtnRetry, Alloy.Globals.strings.dialogBtnContinue],
				cancelIndex : 1,
				success : function didConfirmDevice() {
					setDefaultDevice(passthrough);
				},
				cancel : function didNotConfirmDevice() {
					updatePreferencesApi(passthrough);
				}
			});
		}
	});
}

function setDefaultDeviceApi(passthrough) {
	http.request({
		method : "patient_default_device",
		params : {
			data : [{
				device : {
					deviceType : Ti.Platform.osname,
					deviceId : notificationHandler.deviceToken
				}
			}]
		},
		passthrough : passthrough,
		keepLoader : true,
		errorDialogEnabled : passthrough.errorDialogEnabled,
		success : didSetDefaultDevice,
		failure : passthrough.explicit !== false ? passthrough.failure : didFail
	});
}

function didSetDefaultDevice(result, passthrough) {
	var sModel = Alloy.Collections.patients.findWhere({
		selected : true
	});
	//update local cache
	sModel.set("device_token", notificationHandler.deviceToken);
	/**
	 * check whether any of the reminder mode
	 * is invalid to the current platform,
	 * if then update it to valid one, as set
	 * default device is success
	 * Note:
	 * - passthrough.preferences are pre-processed preferences ready to be sent to api
	 * - passthrough.params are pre-processed preferences will be extended to local cached preferences
	 * upon successful api call
	 */
	var params = passthrough.params,
	    preferences = passthrough.preferences;
	_.each(_.pluck(Alloy.CFG.reminders, "col_pref"), function(val) {
		if (params[val] === Alloy.CFG.apiCodes.reminder_delivery_mode_push_invalid || sModel.get(val) === Alloy.CFG.apiCodes.reminder_delivery_mode_push_invalid) {
			params[val] = preferences[val] = Alloy.CFG.apiCodes.reminder_delivery_mode_push;
		}
	});
	//call api
	updatePreferencesApi(passthrough);
}

function getPushModeForDeviceToken() {
	var deviceToken = Alloy.Collections.patients.findWhere({
		selected : true
	}).get("device_token");
	if (!deviceToken) {
		//if device token on server is null, then set it to current paltform
		return Alloy.CFG.apiCodes.reminder_delivery_mode_push;
	} else if (deviceToken.length === 64) {
		//if valid and 64 chars length, set it to iospush
		return Alloy.CFG.apiCodes.reminder_delivery_mode_push_ios;
	} else {
		//if none above it should be android
		return Alloy.CFG.apiCodes.reminder_delivery_mode_push_android;
	}
}

function hasMandatoryNavigation(mPatient) {
	/**
	 * always the check is made only for
	 * manager account until a patient model
	 * is passed. Useful when the same check
	 * has to be done for other accounts
	 */
	if (!mPatient) {
		mPatient = Alloy.Collections.patients.at(0);
	}
	/**
	 * email verification check
	 * Note: created_at will be in UTC
	 * so calculations should happen in UTC
	 */
	if (!Alloy.Globals.isAccountUpgraded && mPatient.get("is_email_verified") !== "1" && moment.utc().diff(moment.utc(mPatient.get("created_at"), Alloy.CFG.apiCodes.ymd_date_time_format), "days", true) > 1) {
		app.navigator.open({
			ctrl : "emailVerify",
			ctrlArguments : {
				email : mPatient.get("email_address")
			}
		});
		return true;
	}
	return false;
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

function logout(passthrough) {
	/**
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
		passthrough : passthrough,
		keepLoader : true,
		errorDialogEnabled : false,
		success : didLogout,
		failure : didLogout
	});
}

function didLogout(result, passthrough) {

	utilities.setProperty(Alloy.CFG.cc_on_file, false, "bool", false);

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
		//reset authenticate data
		resetAuthenticationData();
		//hide loader
		app.navigator.hideLoader();
		//track session ended
		analyticsHandler.endSession();
		/**
		 * success callback
		 * if any
		 */
		if (passthrough.success) {
			passthrough.success(passthrough);
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

function resetAuthenticationData() {
	/**
	 * reset to device time zone
	 */
	setTimeZone(null);
	/**
	 * reset global variables
	 */
	_.each(["sessionId", "isLoggedIn", "hasProxies", "hasParentProxies", "hasChildProxies", "hasPatientSwitcher"], function(value) {
		delete Alloy.Globals[value];
	});
	/**
	 * reset collections and models
	 */
	var igoreKeys = ["appconfig", "appload", "menuItems", "template", "banner"];
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
}

function getData() {
	return {
		username : Alloy.CFG.auto_populate_username ? encryptionUtil.decrypt(keychain.account) : "",
		password : Alloy.CFG.auto_populate_password ? encryptionUtil.decrypt(keychain.valueData) : ""
	};
}

function forceGetData() {
	return {
		username : encryptionUtil.decrypt(keychain.account),
		password : encryptionUtil.decrypt(keychain.valueData)
	};
}


function setAutoLoginEnabled(value) {
	utilities.setProperty(Alloy.CFG.auto_login_enabled, value, "bool", false);
	/**
	 * immediately reset the keychain if false
	 * user wants to disable it
	 * this may be called from login or account page
	 */
	if (!value && !getTouchIDEnabled()) {
		keychain.reset();
	}
}

function getAutoLoginEnabled() {
	return utilities.getProperty(Alloy.CFG.auto_login_enabled, false, "bool", false);
}

function setTouchIDEnabled(value) {
					Ti.API.info(" ------------  setTouchIDEnabled() value = "+ value)
	utilities.setProperty(Alloy.CFG.touch_id_enabled, value, "bool", false);
}

function getTouchIDEnabled() {
	if(touchID.deviceCanAuthenticate) {
					Ti.API.info(" ------------  getTouchIDEnabled() deviceCanAuthenticate")
		return utilities.getProperty(Alloy.CFG.touch_id_enabled, false, "bool", false);
	} else {
		return false;
	}

}

/**
 * @zone {String} - code value for time zone
 * @updateCodeVal {Boolean} - whether or not to update the selection flag
 * in code values
 */
function setTimeZone(zone, updateCodeVal) {
	/**
	 * update code values
	 * if updateCodeVal is true
	 * need to update updateCodeVal
	 * only when this is a preference update
	 * during time zone check
	 */
	if (updateCodeVal && zone) {
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
 * switches to manager account
 * return the previously selected model
 * Note: should not be used when
 * a patient switcher (template/patientSwitcher)
 * is active in memory / stack
 * suitable for family care, where no
 * patient switcher is used throughout the module
 */
function asManager() {
	var sModel = Alloy.Collections.patients.findWhere({
		selected : true
	});
	if (sModel.get("related_by") !== Alloy.CFG.apiCodes.relationship_manager) {
		//unselect previous model
		sModel.set("selected", false);
		//manager account
		var mPatient = Alloy.Collections.patients.at(0);
		//select manager model
		mPatient.set("selected", true);
		//update session id
		Alloy.Globals.sessionId = mPatient.get("session_id");
	}
	return sModel;
}

/**
 * switches to proxy account
 * which matches the given condition
 * @where {Object} where condition
 * Note: better to not use when
 * a patient switcher (template/patientSwitcher)
 * is active in memory / stack
 * suitable for family care, where no
 * patient switcher is used throughout the module
 */
function asProxy(where) {
	var pModel = Alloy.Collections.patients.findWhere(where);
	if (pModel && !pModel.get("selected")) {
		//current selected model
		var sModel = Alloy.Collections.patients.findWhere({
			selected : true
		});
		//unselect previous model
		sModel.set("selected", false);
		//select given model
		pModel.set("selected", true);
		//update session id
		Alloy.Globals.sessionId = pModel.get("session_id");
	}
	return pModel;
}

/**
 * update family account (patients) collection
 * with get/family api
 * @param {Object}
 * @param.success {Functions} success callback
 * @param.failure {Functions} failure callback
 */
function updateFamilyAccounts(passthrough) {
	if (!passthrough) {
		passthrough = {};
	}
	/**
	 * properties required to identify
	 * this is a explicit call
	 */
	_.extend(passthrough, {
		explicit : true,
		child_id : Alloy.Collections.patients.findWhere({
			selected : true
		}).get("child_id")
	});
	getFamilyAccounts(passthrough);
}

exports.init = init;
exports.logout = logout;
exports.getData = getData;
exports.forceGetData = forceGetData;
exports.asProxy = asProxy;
exports.asManager = asManager;
exports.setTimeZone = setTimeZone;
exports.updatePreferences = updatePreferences;
exports.setAutoLoginEnabled = setAutoLoginEnabled;
exports.getAutoLoginEnabled = getAutoLoginEnabled;
exports.setTouchIDEnabled = setTouchIDEnabled;
exports.getTouchIDEnabled = getTouchIDEnabled;
exports.updateFamilyAccounts = updateFamilyAccounts;
exports.getPushModeForDeviceToken = getPushModeForDeviceToken;
exports.isExpressCheckoutValid = isExpressCheckoutValid;
