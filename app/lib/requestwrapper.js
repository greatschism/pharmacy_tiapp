/**
 * @param {Object} args The arguments for the method
 */

var TAG = "RequestWrapper",
    Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    moment = require("alloy/moment"),
    app = require("core"),
    http = require("http"),
    localization = require("localization"),
    uihelper = require("uihelper"),
    logger = require("logger");

/**
 *  initiate latest request time
 *  doing this in global name space
 *  if local name space is used might not be
 *  updated properly as we go through many callback
 *  Note: callback keeps variables states
 */
Alloy.Globals.latestRequest = moment().unix();

function request(args) {

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
		return sessionTimeout(Alloy.Globals.strings.msgSessionTimeout);
	}

	/**
	 * update time stamp
	 * should be updated here
	 * moving this to any where else or done function
	 * may result in updating this only after all callback
	 * are completed, patient get after authenticate will fail
	 */
	Alloy.Globals.latestRequest = now;

	if (!_.has(args, "type")) {
		args.type = "POST";
	}

	if (!_.has(args, "timeout")) {
		args.timeout = Alloy.CFG.http_timeout;
	}

	if (!_.has(args, "params")) {
		args.params = {};
	}

	if (args.showLoader !== false) {
		if (_.isEmpty(app.navigator) === false) {
			app.navigator.showLoader(args.loaderMessage || Alloy.Globals.strings.msgLoading);
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
	args.params = JSON.stringify(args.params);

	if (Alloy.CFG.encryption_enabled) {
		args.params = require("encryptionUtil").encrypt(args.params);
	}

	/**
	 *  returns the actual http client object
	 */
	return http.request({
		url : Alloy.Models.appconfig.get("ophurl").concat(Alloy.CFG.apiPath[args.method]),
		type : args.type,
		timeout : args.timeout,
		params : args.params,
		success : didSuccess,
		failure : didFail,
		done : didComplete,
		passthrough : args,
		securityManager : Alloy.Globals.securityManager
	});

}

function didSuccess(result, passthrough) {
	if (Alloy.CFG.encryption_enabled) {
		result = require("encryptionUtil").decrypt(result) || "{}";
	}
	/**
	 * should receive data as text from http
	 * before decrypting it can be converted to json
	 */
	result = JSON.parse(result);
	logger.debug(TAG, "response", result.code, result.message);
	if (result.code !== Alloy.CFG.apiCodes.success) {
		/**
		 * handle session timeout
		 * ignore it if logout
		 */
		if (result.errorCode === Alloy.CFG.apiCodes.session_timeout && passthrough.method != "patient_logout") {
			hideLoader(passthrough, true);
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
		hideLoader(passthrough);
		if (passthrough.success) {
			passthrough.success(result, passthrough.passthrough);
		}
	}
}

function didFail(error, passthrough) {
	if (passthrough.errorDialogEnabled !== false) {
		//hide loader before processing error dialogs
		hideLoader(passthrough, true);
		//process error dialogs
		var forceRetry = passthrough.forceRetry === true,
		    retry = forceRetry || passthrough.retry !== false;
		uihelper.showDialog({
			message : error.message || getNetworkErrorMsg(error.code),
			buttonNames : retry ? ( forceRetry ? [Alloy.Globals.strings.dialogBtnRetry] : [Alloy.Globals.strings.dialogBtnRetry, Alloy.Globals.strings.dialogBtnCancel]) : [Alloy.Globals.strings.dialogBtnOK],
			cancelIndex : retry ? ( forceRetry ? -1 : 1) : 0,
			success : function() {
				/**
				 * decrypt string for resending
				 */
				if (Alloy.CFG.encryption_enabled) {
					passthrough.params = require("encryptionUtil").decrypt(passthrough.params);
				}
				//convert string back to json object
				passthrough.params = JSON.parse(passthrough.params);
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

function getNetworkErrorMsg(code) {
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
exports.getNetworkErrorMsg = getNetworkErrorMsg;
