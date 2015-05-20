/**
 * @param {Object} _params The arguments for the method
 */

var Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    app = require("core"),
    uihelper = require("uihelper"),
    http = require("http"),
    localization = require("localization"),
    utilities = require("utilities"),
    XMLTools = require("XMLTools"),
    encryptionUtil = require("encryptionUtil");

function request(_params) {

	if (!_.has(_params, "type")) {
		_params.type = "POST";
	}

	if (!_.has(_params, "timeout")) {
		_params.timeout = Alloy.CFG.HTTP_TIMEOUT * 1000;
	}

	if (!_.has(_params, "format")) {
		_params.format = "json";
	}

	if (!_.has(_params, "data")) {
		_params.data = {};
	}

	if (_params.showLoader !== false) {
		if (_.isEmpty(app.navigator) === false) {
			app.navigator.showLoader(_params.loaderMessage || Alloy.Globals.strings.msgPleaseWait);
		}
		if (_params.showLoaderCallback) {
			_params.showLoaderCallback();
		}
	}

	var format = _params.format.toLowerCase(),
	    url;
	switch(format) {
	case "json":
		url = Alloy.CFG.BASE_URL.concat(Alloy.CFG.apiPath[_params.method]);
		_.extend(_params.data, {
			client_identifier : Alloy.CFG.CLIENT_IDENTIFIER,
			version : Alloy.CFG.API_VERSION,
			session_id : Alloy.Models.user.get("patients").session_id,
			lang : localization.currentLanguage.id
		});
		_params.data = JSON.stringify(_params.data);
		break;
	case "xml":
		url = Alloy.CFG.BASE_URL_LEGACY.concat(Alloy.CFG.apiPath[_params.method]);
		_params.data = XMLTools.toXML(_params.data);
		break;
	}

	if (Alloy.CFG.ENCRYPTION_ENABLED) {
		_params.data = encryptionUtil.encrypt(_params.data);
	}

	if (Alloy.CFG.SIMULATE_API) {
		didSuccess(getSimulatedResponse(_params.method), _params);
		didComplete(_params);
	} else {
		http.request({
			url : url,
			type : _params.type,
			format : _params.format,
			timeout : _params.timeout,
			data : _params.data,
			success : didSuccess,
			failure : didFail,
			done : didComplete,
			passthrough : _params
		});
	}
}

function getSimulatedResponse(_method) {
	return require("data/webservices/stubs")[_method] || {};
}

function didSuccess(_data, _passthrough) {
	if (Alloy.CFG.ENCRYPTION_ENABLED) {
		_data = encryptionUtil.decrypt(_data);
	}
	if (_passthrough.format.toLowerCase() == "xml") {
		_data = XMLTools.toJSON(_data);
		_data = _data[_.keys(_data)[0]];
	}
	if (_data.code != Alloy.CFG.apiCodes.SUCCESS && _.has(_data, "error")) {
		uihelper.showDialog({
			message : _data.message || Alloy.Globals.strings.msgSomethingWentWrong
		});
		if (_passthrough.failure) {
			_passthrough.failure(_data, _passthrough.passthrough);
		}
	} else if (_passthrough.success) {
		_passthrough.success(_data, _passthrough.passthrough);
	}
}

function didFail(_error, _passthrough) {
	if (Alloy.CFG.SIMULATE_API_ON_FAILURE) {
		didSuccess(getSimulatedResponse(_passthrough.method), _passthrough);
	} else {
		var forceRetry = _passthrough.forceRetry !== false,
		    retry = forceRetry || _passthrough.retry !== false;
		if (forceRetry || retry || _passthrough.prompt !== false) {
			if (_.isEmpty(app.navigator) === false) {
				app.navigator.hideLoader();
			}
			if (_passthrough.hideLoaderCallback) {
				_passthrough.hideLoaderCallback();
			}
			uihelper.showDialog({
				message : _passthrough.failureMessage || Alloy.Globals.strings.msgFailedToRetrieve,
				buttonNames : retry ? ( forceRetry ? [Alloy.Globals.strings.btnRetry] : [Alloy.Globals.strings.btnRetry, Alloy.Globals.strings.strCancel]) : [Alloy.Globals.strings.strOK],
				cancelIndex : retry ? ( forceRetry ? -1 : 1) : 0,
				success : function() {
					request(_passthrough);
				},
				cancel : function() {
					if (_passthrough.failure) {
						_passthrough.failure(_error, _passthrough.passthrough);
					}
				}
			});
		} else if (_passthrough.failure) {
			_passthrough.failure(_error, _passthrough.passthrough);
		}
	}
}

function didComplete(_passthrough) {
	if (_passthrough.keepLoader !== true) {
		if (_.isEmpty(app.navigator) === false) {
			app.navigator.hideLoader();
		}
		if (_passthrough.hideLoaderCallback) {
			_passthrough.hideLoaderCallback();
		}
	}
	if (_passthrough.done) {
		_passthrough.done(_passthrough.passthrough);
	}
}

exports.request = request;
