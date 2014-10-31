/**
 * @param {Object} _params The arguments for the method
 */

exports.request = function(_params) {

	var app = require("core"),
	    http = require("http"),
	    dialog = require("dialog"),
	    utilities = require("utilities"),
	    xmlTools = require("XMLTools"),
	    stringCrypto,
	    encryptionKey;

	var httpParams = {
		url : Alloy.CFG.baseUrl.concat(_params.method || ""),
		type : "POST",
		format : "TEXT",
		success : function(_data) {

			/*console.log(_data);
			 if (OS_IOS || OS_ANDROID) {
			 _data = stringCrypto.AESDecrypt(encryptionKey, responseText, false);
			 }
			 console.log(_data);*/

			_data = new xmlTools(_data).toObject();

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
				message : Alloy.Globals.Strings.msgFailedToRetrive
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

	//Convert JSON to XML
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

	var user = Alloy.Models.user.toJSON();
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

	/*console.log(_params.data);
	 if (OS_IOS || OS_ANDROID) {
	 stringCrypto = require("bencoding.securely").createStringCrypto();
	 encryptionKey = Alloy.CFG.staticKey.concat(require("utilities").getRandomString(8));
	 _params.data = stringCrypto.AESEncrypt(encryptionKey, _params.data, false);
	 }
	 console.log(encryptionKey);
	 console.log(_params.data);*/

	_.extend(httpParams, _.omit(_params, ["method", "success", "failure", "done"]));

	http.request(httpParams);

};
