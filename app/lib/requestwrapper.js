/**
 * @param {Object} args The arguments for the method
 */

var TAG = "REWR",
    Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    moment = require("alloy/moment"),
    app = require("core"),
    http = require("http"),
    encryptionUtil = require("encryptionUtil"),
    localization = require("localization"),
    uihelper = require("uihelper"),
    ctrlShortCode = require("ctrlShortCode"),
    logger = require("logger");

function request(args) {
	
	// Ti.API.info(Alloy.Models.appconfig.get("ophurl").concat(Alloy.CFG.apiPath[args.method]));

	// Ti.API.info(JSON.stringify(args.params));
	
	/**
	 * trigger session timeout
	 * if session id is available and time of latest api call is more than session_timeout
	 * and must not be a patient logout
	 */
	var now = moment().unix();
	if (Alloy.Globals.sessionId && (now - Alloy.Globals.latestRequest) > Alloy.CFG.session_timeout && args.method != "patient_logout") {
		/**
		 *  hide loader is required in case
		 *  it was created by a previous network call
		 *  with keep loader set to true
		 */
		app.navigator.hideLoader();
		logger.warn(TAG, "session time out", "last request", Alloy.Globals.latestRequest, "now", now);
		return sessionTimeout(Alloy.Globals.strings.msgSessionTimeout);
	}

	/**
	 * update time stamp
	 * should be done here
	 * moving this to any where else or done function
	 * may result in updating this only after all callback
	 * are completed, request may fail
	 */
	Alloy.Globals.latestRequest = now;

	//add default values
	_.defaults(args, {
		params : {},
		type : "POST",
		timeout : Alloy.CFG.http_timeout,
		loaderMessage : Alloy.Globals.strings.msgLoading
	});

	/**
	 * set feature code
	 * if not set already
	 * Note: if current controller
	 * is not available, use GLOB
	 * as keyword for module
	 */
	if (!_.has(args.params, "feature_code")) {
		args.params.feature_code = Alloy.CFG.platform_code + "-" + Alloy.CFG.apiShortCode[args.method] + "-" + (ctrlShortCode[app.navigator.currentController.ctrlPath] || TAG);
	}

	if (args.showLoader !== false) {
		if (_.isEmpty(app.navigator) === false) {
			app.navigator.showLoader(args.loaderMessage);
		}
		if (args.showLoaderCallback) {
			args.showLoaderCallback();
		}
	}

	_.extend(args.params, {
		client_identifier : Alloy.Models.appload.get("client_id"),
		version : Alloy.CFG.api_version,
		lang : localization.currentLanguage.code,
		msi_log_id : Alloy.Models.appload.get("msi_log_id"),
		session_id : Alloy.Globals.sessionId
	});

	var requestParams = _.pick(args, ["type", "timeout"]);
	//additional arguments
	_.extend(requestParams, {
		url : Alloy.Models.appconfig.get("ophurl").concat(Alloy.CFG.apiPath[args.method]),
		passthrough : args,
		success : didSuccess,
		failure : didFail,
		done : didComplete
	});
	/**
	 * sending undefined / null values
	 * to securityManager property of http
	 * client will throw exception on android
	 */
	if (Alloy.Globals.securityManager) {
		requestParams.securityManager = Alloy.Globals.securityManager;
	}
	//put params as string
	requestParams.params = JSON.stringify(args.params);
	if (!ENV_PROD) {
		Ti.API.debug(TAG + ":DEV-ONLY:request-data:" + requestParams.params);
	}
	//encrypt if enabled
	if (Alloy.CFG.encryption_enabled) {
		requestParams.params = encryptionUtil.encrypt(requestParams.params);
	}
	logger.debug(TAG, "request", args.params.feature_code);
	//returns the actual http client object
	return http.request(requestParams);
}

function didSuccess(result, passthrough) {
	//decrypt if encryption is enabled
	if (Alloy.CFG.encryption_enabled) {
		result = encryptionUtil.decrypt(result) || "{}";
	}
	if (!ENV_PROD) {
		Ti.API.debug(TAG + ":DEV-ONLY:response-data:" + result);
        Ti.API.info(TAG + ":DEV-ONLY:response-data:" + result);
	}
	/**
	 * should receive data as text from http
	 * before decrypting it can be converted to json
	 */
	result = JSON.parse(result);
	if (result.code !== Alloy.CFG.apiCodes.success) {
		/**
		 * handle session timeout
		 * ignore if method is logout
		 * Note: check for isLoggedIn flag
		 * to avoid session timeout dialog while
		 * authenticator is in progress
		 */
		if (Alloy.Globals.isLoggedIn && result.errorCode === Alloy.CFG.apiCodes.session_timeout && passthrough.method != "patient_logout") {
			hideLoader(passthrough, true);
			logger.error(TAG, "failure", passthrough.params.feature_code, "session time out");
			return sessionTimeout(result.message);
		}
		/**
		 * this is a error response by server
		 * not a actual http error
		 * so avoid retry alerts
		 */
		passthrough.retry = false;
		return didFail(result, passthrough);
	} else {
		logger.debug(TAG, "success", passthrough.params.feature_code, "code", result.code);
		hideLoader(passthrough);
		if (passthrough.success) {
			passthrough.success(result, passthrough.passthrough);
		}
	}
}

function didFail(error, passthrough) {
	logger.debug(TAG, "failure", passthrough.params.feature_code, "code", error.code, "errorCode", error.errorCode);
	if (passthrough.errorDialogEnabled !== false) {
		//hide loader before processing error dialogs
		hideLoader(passthrough, true);
		//process error dialogs
		var forceRetry = passthrough.forceRetry === true,
		    retry = forceRetry || passthrough.retry !== false;
		uihelper.showDialog({
			message : error.message || getNetworkErrorByCode(error.code),
			buttonNames : retry ? ( forceRetry ? [Alloy.Globals.strings.dialogBtnRetry] : [Alloy.Globals.strings.dialogBtnRetry, Alloy.Globals.strings.dialogBtnCancel]) : [Alloy.Globals.strings.dialogBtnOK],
			cancelIndex : retry ? ( forceRetry ? -1 : 1) : 0,
			success : function() {
				request(passthrough);
			},
			cancel : function() {
				/**
				 * loader is already hidden
				 * from the code above
				 * for the convenience of showing
				 * error dialogs
				 */
				if (passthrough.failure) {
					passthrough.failure(error, passthrough.passthrough);
				}
			}
		});
	} else if (passthrough.failure) {
		/**
		 * hide loader when failure callback is passed
		 * leave it if keepLoader is true
		 */
		hideLoader(passthrough);
		passthrough.failure(error, passthrough.passthrough);
	} else {
		/**
		 * hide loader when no failure callback is passed
		 * even if keepLoader is true
		 */
		hideLoader(passthrough, true);
	}
}

function hideLoader(passthrough, forceHide) {
	/**
	 * if the api call failed
	 * hide the loader even
	 * when keepLoader is true
	 * Note: most of the times failure callback
	 * may not be used, in such cases
	 * keppLoader may fail to remove loader
	 * at all. forceHide flag let us know
	 * whether failure callback is applied or not
	 */
	if (passthrough.keepLoader !== true || forceHide) {
		if (_.isEmpty(app.navigator) === false) {
			app.navigator.hideLoader();
		}
		if (passthrough.hideLoaderCallback) {
			passthrough.hideLoaderCallback();
		}
	}
}

function didComplete(passthrough) {
	if (passthrough.done) {
		passthrough.done(passthrough.passthrough);
	}
}

function getNetworkErrorByCode(code) {
	/**
	 * to do: define error code for
	 * timeout and show "msgNetworkTimeout"
	 */
	var key;
	switch(code) {
	case 0:
		key = "msgNoInternet";
		break;
	default:
		key = "msgUnknownError";
	}
	return Alloy.Globals.strings[key];
}

function sessionTimeout(message) {
	uihelper.showDialog({
		message : message,
		success : didConfirmLogout
	});
}

function didConfirmLogout() {
	require("authenticator").logout();
}

exports.request = request;
exports.getNetworkErrorByCode = getNetworkErrorByCode;
