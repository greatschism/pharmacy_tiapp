/**
 * @param {Object} args The arguments for the method
 */

var TAG = "RequestWrapper",
    Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    app = require("core"),
    uihelper = require("uihelper"),
    http = require("http"),
    localization = require("localization"),
    utilities = require("utilities"),
    encryptionUtil = require("encryptionUtil"),
    logger = require("logger");

function request(args) {

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
		session_id : Alloy.Models.patient.get("session_id")
	});
	args.params = JSON.stringify(args.params, null, 4);

	if (Alloy.CFG.encryption_enabled) {
		args.params = encryptionUtil.encrypt(args.params);
	}

	http.request({
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
	if (result.code !== Alloy.CFG.apiCodes.success_code) {
		if (passthrough.errorDialogEnabled !== false) {
			if (passthrough.forceRetry === true) {
				passthrough.failureMessage = result.message || Alloy.Globals.strings.msgUnknownError;
				return didFail(result, passthrough);
			}
			uihelper.showDialog({
				message : result.message || Alloy.Globals.strings.msgUnknownError
			});
		}
		hideLoader(passthrough);
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
	var forceRetry = passthrough.forceRetry === true,
	    retry = forceRetry || passthrough.retry !== false;
	if (passthrough.errorDialogEnabled !== false && (forceRetry || retry)) {
		if (_.isEmpty(app.navigator) === false) {
			app.navigator.hideLoader();
		}
		if (passthrough.hideLoaderCallback) {
			passthrough.hideLoaderCallback();
		}
		uihelper.showDialog({
			message : passthrough.failureMessage || Alloy.Globals.strings.msgNetworkError,
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
				hideLoader(passthrough);
				if (passthrough.failure) {
					passthrough.failure(error, passthrough.passthrough);
				}
			}
		});
	} else {
		hideLoader(passthrough);
		if (passthrough.failure) {
			passthrough.failure(error, passthrough.passthrough);
		}
	}
}

function hideLoader(passthrough) {
	if (passthrough.keepLoader !== true) {
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

exports.request = request;
