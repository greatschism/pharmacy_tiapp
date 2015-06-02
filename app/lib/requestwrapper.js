/**
 * @param {Object} params The arguments for the method
 */

var Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    app = require("core"),
    uihelper = require("uihelper"),
    http = require("http"),
    localization = require("localization"),
    utilities = require("utilities"),
    encryptionUtil = require("encryptionUtil");

function request(params) {

	if (!_.has(params, "type")) {
		params.type = "POST";
	}

	if (!_.has(params, "timeout")) {
		params.timeout = Alloy.CFG.HTTP_TIMEOUT * 1000;
	}

	if (!_.has(params, "format")) {
		params.format = "json";
	}

	if (!_.has(params, "data")) {
		params.data = {};
	}

	if (params.showLoader !== false) {
		if (_.isEmpty(app.navigator) === false) {
			app.navigator.showLoader(params.loaderMessage || Alloy.Globals.strings.msgPleaseWait);
		}
		if (params.showLoaderCallback) {
			params.showLoaderCallback();
		}
	}

	_.extend(params.data, {
		feature_code : Alloy.CFG.featureCodes[params.method],
		client_identifier : Alloy.CFG.CLIENT_IDENTIFIER,
		version : Alloy.CFG.API_VERSION,
		lang : localization.currentLanguage.id,
		session_id : Alloy.Models.user.get("patients").session_id
	});
	params.data = JSON.stringify(params.data);

	if (Alloy.CFG.ENCRYPTION_ENABLED) {
		params.data = encryptionUtil.encrypt(params.data);
	}

	http.request({
		url : Alloy.CFG.BASE_URL.concat(Alloy.CFG.apiPath[params.method]),
		type : params.type,
		format : params.format,
		timeout : params.timeout,
		data : params.data,
		success : didSuccess,
		failure : didFail,
		done : didComplete,
		passthrough : params
	});

}

function didSuccess(data, passthrough) {
	if (Alloy.CFG.ENCRYPTION_ENABLED) {
		data = encryptionUtil.decrypt(data);
	}
	if (data.code != Alloy.CFG.apiCodes.SUCCESS && _.has(data, "error")) {
		uihelper.showDialog({
			message : data.message || Alloy.Globals.strings.msgSomethingWentWrong
		});
		if (passthrough.failure) {
			passthrough.failure(data, passthrough.passthrough);
		}
	} else if (passthrough.success) {
		passthrough.success(data, passthrough.passthrough);
	}
}

function didFail(error, passthrough) {
	if (!ENV_PROD && Alloy.CFG.SIMULATE_API_ON_FAILURE) {
		didSuccess({
			code : Alloy.CFG.apiCodes.SUCCESS,
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
