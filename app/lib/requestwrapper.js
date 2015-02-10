/**
 * @param {Object} _params The arguments for the method
 */

var Alloy = require("alloy"),
    app = require("core"),
    http = require("http"),
    dialog = require("dialog"),
    localization = require("localization"),
    utilities = require("utilities"),
    CFG = Alloy.CFG,
    user = {},
    encryptionUtil;

if (OS_IOS || OS_ANDROID) {
	encryptionUtil = require("encryptionUtil");
}

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

	if (_params.blockUI !== false) {
		if (_.isEmpty(app.navigator) === false) {
			app.navigator.showLoader({
				message : _params.blockerMessage || Alloy.Globals.strings.msgPleaseWait
			});
		}
		if (_params.blockUICallback) {
			_params.blockUICallback();
		}
	}

	_.extend(_params.data, {
		client_identifier : CFG.clientIdentifier,
		version : CFG.apiVersion,
		session_id : user.sessionId,
		lang : localization.currentLanguage.id
	});
	_params.data = JSON.stringify(_params.data);

	if (OS_IOS || OS_ANDROID) {
		if (CFG.enableEncryption) {
			_params.data = encryptionUtil.encrypt(_params.data);
		}
	}

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

function getSimulatedResponse(_passthrough) {
	_passthrough.success((JSON.parse(utilities.getFile("data/webservices/stubs.json")) || {})[_passthrough.method], _passthrough.passthrough || {});
}

function didSuccess(_data, _passthrough) {
	if (CFG.simulateAPI) {
		getSimulatedResponse(_passthrough);
	} else {
		if (OS_IOS || OS_ANDROID) {
			if (CFG.enableEncryption) {
				_data = encryptionUtil.decrypt(_data);
			}
		}
		if (_data.status != "Success") {
			dialog.show({
				message : _data.message
			});
			if (_passthrough.failure) {
				_passthrough.failure(_passthrough);
			}
		} else if (_passthrough.success) {
			_passthrough.success(_data, _passthrough);
		}
	}
}

function didFail(_passthrough) {
	if (CFG.simulateAPI || CFG.simulateAPIOnFailure) {
		getSimulatedResponse(_passthrough);
	} else {
		var forceRetry = _passthrough.forceRetry !== false,
		    retry = forceRetry || _passthrough.retry !== false;
		if (forceRetry || retry || _passthrough.prompt !== false) {
			if (_.isEmpty(app.navigator) === false) {
				app.navigator.hideLoader();
			}
			if (_passthrough.unblockUICallback) {
				_passthrough.unblockUICallback();
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
						_passthrough.failure();
					}
				}
			});
		} else if (_passthrough.failure) {
			_passthrough.failure();
		}
	}
}

function didComplete(_passthrough) {
	if ((_passthrough.keepBlook !== true || _.isEmpty(_passthrough.failure))) {
		if (_.isEmpty(app.navigator) === false) {
			app.navigator.hideLoader();
		}
		if (_passthrough.unblockUICallback) {
			_passthrough.unblockUICallback();
		}
	}
	if (_passthrough.done) {
		_passthrough.done();
	}
}

exports.request = request;
