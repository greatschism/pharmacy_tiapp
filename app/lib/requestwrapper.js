/**
 * @param {Object} args The arguments for the method
 */

var Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    app = require("core"),
    uihelper = require("uihelper"),
    http = require("http"),
    localization = require("localization"),
    utilities = require("utilities"),
    encryptionUtil = require("encryptionUtil");

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
			app.navigator.showLoader(args.loaderMessage || Alloy.Globals.strings.msgPleaseWait);
		}
		if (args.showLoaderCallback) {
			args.showLoaderCallback();
		}
	}

	_.extend(args.params, {
		feature_code : Alloy.CFG.featureCodes[args.method],
		client_identifier : Alloy.CFG.client_identifier,
		version : Alloy.CFG.api_version,
		lang : localization.currentLanguage.id,
		session_id : Alloy.Models.user.get("patients").session_id
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
	if (Alloy.CFG.encryption_enabled) {
		result = encryptionUtil.decrypt(result);
	}
	if (result.code != Alloy.CFG.apiCodes.success_code) {
		if (passthrough.errorDialogEnabled !== false) {
			uihelper.showDialog({
				message : result.message || Alloy.Globals.strings.msgSomethingWentWrong
			});
		}
		if (passthrough.failure) {
			passthrough.failure(result, passthrough.passthrough);
		}
	} else if (passthrough.success) {
		passthrough.success(result, passthrough.passthrough);
	}
}

function didFail(error, passthrough) {
	if (!ENV_PROD && Alloy.CFG.simulate_api_on_failure) {
		didSuccess({
			code : Alloy.CFG.apiCodes.success_code,
			status : Alloy.CFG.apiCodes.success_status,
			data : {}
		}, passthrough);
	} else {
		var forceRetry = passthrough.forceRetry !== false,
		    retry = forceRetry || passthrough.retry !== false;
		if (forceRetry || retry || passthrough.prompt !== false) {
			if (_.isEmpty(app.navigator) === false) {
				app.navigator.hideLoader();
			}
			if (passthrough.hideLoaderCallback) {
				passthrough.hideLoaderCallback();
			}
			uihelper.showDialog({
				message : passthrough.failureMessage || Alloy.Globals.strings.msgFailedToRetrieve,
				buttonNames : retry ? ( forceRetry ? [Alloy.Globals.strings.btnRetry] : [Alloy.Globals.strings.btnRetry, Alloy.Globals.strings.strCancel]) : [Alloy.Globals.strings.strOK],
				cancelIndex : retry ? ( forceRetry ? -1 : 1) : 0,
				success : function() {
					if (Alloy.CFG.encryption_enabled) {
						passthrough.params = encryptionUtil.decrypt(passthrough.params);
					}
					passthrough.params = JSON.parse(passthrough.params);
					request(passthrough);
				},
				cancel : function() {
					if (passthrough.failure) {
						passthrough.failure(error, passthrough.passthrough);
					}
				}
			});
		} else if (passthrough.failure) {
			passthrough.failure(error, passthrough.passthrough);
		}
	}
}

function didComplete(passthrough) {
	if (passthrough.keepLoader !== true) {
		if (_.isEmpty(app.navigator) === false) {
			app.navigator.hideLoader();
		}
		if (passthrough.hideLoaderCallback) {
			passthrough.hideLoaderCallback();
		}
	}
	if (passthrough.done) {
		passthrough.done(passthrough.passthrough);
	}
}

exports.request = request;
