/**
 * @param {Object} _params The arguments for the method
 */

var app = require("core"),
    dialog = require("dialog"),
    http = require("http"),
    localization = require("localization"),
    utilities = require("utilities"),
    CFG = Alloy.CFG,
    user = {},
    encryptionUtil = require("encryptionUtil");

function request(_params) {

	user = Alloy.Models.user.toJSON();

	if (!_.has(_params, "format")) {
		_params.format = "JSON";
	}

	if (!_.has(_params, "data")) {
		_params.data = {};
	}

	if (!_.has(_params, "type")) {
		_params.type = "POST";
	}

	if (_params.showLoader !== false) {
		if (_.isEmpty(app.navigator) === false) {
			app.navigator.showLoader(_params.loaderMessage || Alloy.Globals.strings.msgPleaseWait);
		}
		if (_params.showLoaderCallback) {
			_params.showLoaderCallback();
		}
	}

	_.extend(_params.data, {
		client_identifier : CFG.clientIdentifier,
		version : CFG.apiVersion,
		session_id : user.patients.session_id,
		lang : localization.currentLanguage.id
	});
	_params.data = JSON.stringify(_params.data);

	if (CFG.enableEncryption) {
		_params.data = encryptionUtil.encrypt(_params.data);
	}

	if (CFG.simulateAPI) {
		didSuccess(getSimulatedResponse(_params.method), _params);
		didComplete(_params);
	} else {
		http.request({
			url : CFG.baseUrl.concat(CFG.apiPath[_params.method]),
			type : _params.type,
			format : _params.format,
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
	if (CFG.enableEncryption) {
		_data = encryptionUtil.decrypt(_data);
	}
	if (_data.code != CFG.apiCodes.SUCCESS) {
		dialog.show({
			message : _data.message || Alloy.Globals.strings.msgSomethingWentWrong
		});
		if (_passthrough.failure) {
			_passthrough.failure(_passthrough.passthrough);
		}
	} else if (_passthrough.success) {
		_passthrough.success(_data, _passthrough.passthrough);
	}
}

function didFail(_passthrough) {
	if (CFG.simulateAPIOnFailure) {
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
			dialog.show({
				message : _passthrough.failureMessage || Alloy.Globals.strings.msgFailedToRetrieve,
				buttonNames : retry ? ( forceRetry ? [Alloy.Globals.strings.btnRetry] : [Alloy.Globals.strings.btnRetry, Alloy.Globals.strings.strCancel]) : [Alloy.Globals.strings.strOK],
				cancelIndex : retry ? ( forceRetry ? -1 : 1) : 0,
				success : function() {
					request(_passthrough);
				},
				cancel : function() {
					if (_passthrough.failure) {
						_passthrough.failure(_passthrough.passthrough);
					}
				}
			});
		} else if (_passthrough.failure) {
			_passthrough.failure(_passthrough.passthrough);
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
		_passthrough.done();
	}
}

exports.request = request;
