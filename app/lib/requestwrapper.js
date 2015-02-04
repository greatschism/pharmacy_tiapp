/**
 * @param {Object} _params The arguments for the method
 */

var Alloy = require("alloy"),
    app = require("core"),
    http = require("http"),
    dialog = require("dialog"),
    utilities = require("utilities"),
    xmlTools = require("XMLTools"),
    CFG = Alloy.CFG,
    user = {},
    encryptionUtil;

if (OS_IOS || OS_ANDROID) {
	encryptionUtil = require("encryptionUtil");
}

function request(_params) {

	user = Alloy.Models.user.toJSON();

	if (!_.has(_params, "format")) {
		_params.format = "TEXT";
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

	if (_params.format == "TEXT" && _params.dataTransform !== false) {

		var xml = "";
		var jsonToXml = function(json) {
			for (var i in json) {
				xml += "<" + i + ">";
				if ( typeof json[i] === "object") {
					jsonToXml(json[i]);
				} else {
					xml += json[i];
				}
				xml += "</" + i + ">";
			}
		};
		if ( typeof _params.data != "string") {
			jsonToXml(_params.data);
			_params.data = xml;
			_params.dataTransform = false;
		}

		var headers = [{
			key : "sessionid",
			value : user.sessionId
		}, {
			key : "clientid",
			value : user.appLoad.client_id || "1"
		}, {
			key : "language",
			value : ""
		}];
		if (_.has(user.appLoad, "apploadid")) {
			headers.push({
				key : "apploadid",
				value : user.appLoad.id
			});
		}
		if (user.sessionId) {
			headers.push({
				key : "mscriptstoken",
				value : user.appLoad.default_token
			});
		}
		_params.headers = _.union(headers, _params.headers || []);

	} else {

		_.extend(_params.data, {
			client_identifier : CFG.clientIdentifier,
			version : CFG.apiVersion,
			session_id : user.sessionId
		});
		_params.data = JSON.stringify(_params.data);

	}

	if (OS_IOS || OS_ANDROID) {
		if (CFG.enableEncryption) {
			_params.data = encryptionUtil.encrypt(_params.data);
		}
	}

	http.request({
		url : _params.method ? "https://staging.remscripts.com/pdxonphonehandlerv6_4_3/".concat(_params.method) : CFG.baseUrl.concat(_params.path),
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
	_passthrough.success((JSON.parse(utilities.getFile("data/webservices/stubs.json")) || {})[_passthrough.path], _passthrough.passthrough || {});
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

		if (_passthrough.format == "TEXT") {
			_data = new xmlTools(_data).toObject();
		}

		var error = _data[_.keys(_data)[0]].error;
		if (_.isObject(error)) {
			dialog.show({
				message : error.errormessage
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
