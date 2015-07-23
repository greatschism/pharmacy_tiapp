/**
 * @param {Object} args The arguments for the method
 */

var TAG = "RequestWrapper",
    Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    moment = require("alloy/moment"),
    app = require("core"),
    uihelper = require("uihelper"),
    http = require("http"),
    localization = require("localization"),
    utilities = require("utilities"),
    encryptionUtil = require("encryptionUtil"),
    logger = require("logger"),
    lastRequest = moment().unix();

function request(args) {

	var sessionId = Alloy.Models.patient.get("session_id");

	//trigger session timeout
	if (sessionId && (moment().unix() - lastRequest) > Alloy.CFG.session_timeout) {
		hideLoader(args, true);
		return sessionTimeout(Alloy.Globals.strings.msgSeesionTimeout);
	}

	//update time stamp
	lastRequest = moment().unix();

	if (!_.has(args, "type")) {
		args.type = "POST";
	}

	if (!_.has(args, "timeout")) {
		args.timeout = Alloy.CFG.http_timeout;
	}

	if (!_.has(args, "format")) {
		args.format = "json";
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
		args.params = encryptionUtil.encrypt(args.params);
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
	logger.debug(TAG, "response", result.code, result.message);
	if (Alloy.CFG.encryption_enabled) {
		result = encryptionUtil.decrypt(result);
	}
	if (result.code !== Alloy.CFG.apiCodes.success) {
		//handle session timeout
		if (result.errorCode === Alloy.CFG.apiCodes.session_expired) {
			hideLoader(passthrough, true);
			return sessionTimeout(result.message);
		}
		if (passthrough.errorDialogEnabled !== false) {
			if (passthrough.retry !== false || passthrough.forceRetry === true) {
				return didFail(result, passthrough);
			}
			uihelper.showDialog({
				message : result.message || getErrorMessage(result.code)
			});
		}
		hideLoader(passthrough, true);
		if (passthrough.failure) {
			passthrough.failure(result, passthrough.passthrough);
		}
	} else {
		hideLoader(passthrough);
		if (passthrough.success) {
			passthrough.success(result, passthrough.passthrough);
		}
	}
}

function didFail(error, passthrough) {
	if (passthrough.errorDialogEnabled !== false) {
		var forceRetry = passthrough.forceRetry === true,
		    retry = forceRetry || passthrough.retry !== false;
		hideLoader(passthrough, true);
		uihelper.showDialog({
			message : error.message || getErrorMessage(result.code),
			buttonNames : retry ? ( forceRetry ? [Alloy.Globals.strings.dialogBtnRetry] : [Alloy.Globals.strings.dialogBtnRetry, Alloy.Globals.strings.dialogBtnCancel]) : [Alloy.Globals.strings.dialogBtnOK],
			cancelIndex : retry ? ( forceRetry ? -1 : 1) : 0,
			success : function() {
				if (Alloy.CFG.encryption_enabled) {
					passthrough.params = encryptionUtil.decrypt(passthrough.params);
				}
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
	} else {
		hideLoader(passthrough, true);
		if (passthrough.failure) {
			passthrough.failure(error, passthrough.passthrough);
		}
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
	if (passthrough.done) {
		passthrough.done(passthrough.passthrough);
	}
}

function getErrorMessage(code) {

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
