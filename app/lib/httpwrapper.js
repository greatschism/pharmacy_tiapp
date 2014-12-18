/**
 * @param {Object} _params The arguments for the method
 */

var cfg = Alloy.CFG,
    app = require("core"),
    http = require("http"),
    dialog = require("dialog"),
    xmlTools = require("XMLTools");

if (OS_IOS || OS_ANDROID) {
	var encryptionUtil = require("encryptionUtil");
}

function request(_params) {

	var format = _params.format || "TEXT",
	    user = Alloy.Models.user.toJSON();

	var httpParams = {
		url : _params.method ? "https://staging.remscripts.com/pdxonphonehandlerv6_4_3/".concat(_params.method) : cfg.baseUrl.concat(_params.path),
		type : "POST",
		format : format,
		success : function(_data) {

			/*if (OS_IOS || OS_ANDROID) {
			 _data = encryptionUtil.decrypt(_data);
			 }*/

			if (format == "TEXT") {
				_data = new xmlTools(_data).toObject();
			}

			var error = _data[_.keys(_data)[0]].error;
			if (_.isObject(error)) {
				dialog.show({
					message : error.errormessage
				});
				if (_params.failure) {
					_params.failure(_data);
				}
			} else if (_params.success) {
				_params.success(_data);
			}
		},
		failure : function(http, url) {
			var retry = _params.retry !== false;
			if (_params.failure) {
				_params.failure();
			}
			dialog.show({
				message : Alloy.Globals.strings.msgFailedToRetrieve,
				buttonNames : retry ? [Alloy.Globals.strings.btnRetry, Alloy.Globals.strings.strCancel] : [Alloy.Globals.strings.strOK],
				cancelIndex : retry ? 1 : 0,
				success : function() {
					request(_params);
				}
			});
		},
		done : function() {
			if ((_params.keepBlook !== true || _.isEmpty(_params.failure)) && _.isEmpty(app.navigator) === false) {
				app.navigator.hideLoader();
			}
			if (_params.done) {
				_params.done();
			}
		}
	};

	if (_params.blockUI !== false && _.isEmpty(app.navigator) === false) {
		app.navigator.showLoader({
			message : Alloy.Globals.strings.msgPleaseWait
		});
	}

	if (format == "TEXT") {

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
		jsonToXml(_params.data);
		_params.data = xml;

		var headers = [{
			key : "sessionid",
			value : user.sessionId
		}, {
			key : "clientid",
			value : user.appLoad.clientid || ""
		}, {
			key : "language",
			value : ""
		}];
		if (_.has(user.appLoad, "apploadid")) {
			headers.push({
				key : "apploadid",
				value : user.appLoad.apploadid
			});
		}
		if (user.sessionId) {
			headers.push({
				key : "mscriptstoken",
				value : user.appLoad.mscriptstoken
			});
		}
		_params.headers = _.union(headers, _params.headers || []);

	} else {
		_.extend(_params.data, {
			client_identifier : cfg.clientIdentifier,
			version : cfg.apiVersion,
			session_id : user.sessionId
		});
		_params.data = JSON.stringify(_params.data);
	}

	/*if (OS_IOS || OS_ANDROID) {
	 _params.data = encryptionUtil.encrypt(_params.data);
	 }*/

	_.extend(httpParams, _.omit(_params, ["method", "format", "success", "failure", "done"]));

	http.request(httpParams);
}

exports.request = request;
