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
 *  initiate last request time
 *  using this 
 */
Alloy.Globals.lastRequest = moment().unix();

function request(args) {

	var sessionId = Alloy.Models.patient.get("session_id");

	/**
	 * trigger session timeout
	 * if session id is avaibale and time of last api call is more than session_timeout
	 * and must not be a patient logout
	 */
	if (sessionId && (moment().unix() - Alloy.Globals.lastRequest) > Alloy.CFG.session_timeout && args.method != "patient_logout") {
		/**
		 *  hide loader is required in case
		 *  it was created by a previous network call
		 *  with keep loader set to true
		 */
		app.navigator.hideLoader();
		return sessionTimeout(Alloy.Globals.strings.msgSeesionTimeout);
	}

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
		client_identifier : Alloy.CFG.client_identifier,
		version : Alloy.CFG.api_version,
		lang : localization.currentLanguage.code,
		msi_log_id : Alloy.Models.appload.get("msi_log_id"),
		session_id : sessionId
	});
	args.params = JSON.stringify(args.params, null, 4);

	if (Alloy.CFG.encryption_enabled) {
		args.params = require("encryptionUtil").encrypt(args.params);
	}

	/**
	 *  returns the actual http client object
	 */
	return http.request({
		url : Alloy.CFG.base_url.concat(Alloy.CFG.apiPath[args.method]),
		type : args.type,
		format : args.format,
		timeout : args.timeout,
		params : args.params,
		success : didSuccess,
		failure : didFail,
		done : didComplete,
		passthrough : args
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
	hideLoader(passthrough, true);
	if (passthrough.errorDialogEnabled !== false) {
		var forceRetry = passthrough.forceRetry === true,
		    retry = forceRetry || passthrough.retry !== false;
		uihelper.showDialog({
			message : error.message || getErrorMessage(result.code),
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
		passthrough.failure(error, passthrough.passthrough);
	}
}

function hideLoader(passthrough, isFailure) {
	/**
	 * if the api call failed
	 * hide the loader even
	 * when keepLoader is true
	 * Note: most of the times failure callback
	 * may not be used, in such cases
	 * keppLoader may fail to remove loader
	 * at all
	 */
	if (passthrough.keepLoader !== true || isFailure) {
		if (_.isEmpty(app.navigator) === false) {
			app.navigator.hideLoader();
		}
		if (passthrough.hideLoaderCallback) {
			passthrough.hideLoaderCallback();
		}
	}
}

function didComplete(passthrough) {
	//update time stamp
	Alloy.Globals.lastRequest = moment().unix();
	//process done
	if (passthrough.done) {
		passthrough.done(passthrough.passthrough);
	}
}

function getErrorMessage(code) {
	var key;
	switch(code) {
	case 404:
		key = "msgServicesDown";
		break;
	case -1001:
	case -1002:
		key = "msgNetworkTimeout";
		break;
	case -1004:
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
