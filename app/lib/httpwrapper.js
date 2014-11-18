/**
 * @param {Object} _params The arguments for the method
 */

var app = require("core"),
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
		url : _params.method ? Alloy.CFG.baseUrl.concat(_params.method) : _params.url,
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
			dialog.show({
				message : Alloy.Globals.Strings.msgFailedToRetrieve
			});
			if (_params.failure) {
				_params.failure();
			}
		},
		done : function() {
			if (_params.keepBlook !== true && _.isEmpty(app.navigator) === false) {
				app.navigator.hideLoader();
			}
			if (_params.done) {
				_params.done();
			}
		}
	};

	if (_params.blockUI !== false && _.isEmpty(app.navigator) === false) {
		app.navigator.showLoader({
			message : Alloy.Globals.Strings.msgPleaseWait
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
			patient_identifier : {
				session_id : user.sessionId
			}
		});
		_params.data = "action=" + _params.action + "&client_identifier=" + Alloy.CFG.clientIdentifier + "&version=" + Alloy.CFG.apiVersion + "&data=" + JSON.stringify(_params.data);
	}

	/*if (OS_IOS || OS_ANDROID) {
	 _params.data = encryptionUtil.encrypt(_params.data);
	 }*/

	_.extend(httpParams, _.omit(_params, ["method", "format", "success", "failure", "done"]));

	http.request(httpParams);
}

exports.request = request;
