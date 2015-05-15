/**
 * HTTP request class
 *
 * @class http
 */
var logger = require("logger");

/**
 * Standard HTTP Request
 * @param {Object} _params The arguments for the method
 * @param {Number} _params.timeout Timeout time, in milliseconds
 * @param {String} _params.type Type of request, "GET", "POST", etc
 * @param {String} _params.format Format of return data, one of "JSON", "TEXT", "XML" or "DATA"
 * @param {String} _params.url The URL source to call
 * @param {Array} _params.headers Array of request headers to send
 * @param {Object|String} _params.data The data to send
 * @param {Function} _params.failure A function to execute when there is an XHR error
 * @param {Function} _params.success A function to execute when when successful
 * @param {Function} _params.done A function to execute after the success or failure callback
 * @param {Object} _params.passthrough Parameters to pass through to the failure or success callback
 */
exports.request = function(_params) {

	logger.debug("HTTP.request " + _params.url);

	if (Ti.Network.online) {

		var xhr = Ti.Network.createHTTPClient();

		xhr.timeout = _params.timeout ? _params.timeout : 10000;

		/**
		 * Data return
		 * @param {Object} _data The HTTP SuccessResponse object
		 * @ignore
		 */
		xhr.onload = function(response) {

			logger.debug("HTTP.response " + (this.responseText || "No response or unable to parse the response"));

			var _data;

			switch(_params.format.toLowerCase()) {
			case "data":
				_data = this.responseData || this.responseText || "{}";
				break;
			case "xml":
				_data = this.responseXML || Ti.XML.parseString(this.responseText || "<response />");
				break;
			case "json":
				_data = JSON.parse(this.responseText || "{}");
				break;
			case "text":
				_data = this.responseText || "";
				break;
			}

			if (_params.success) {
				_params.success(_data, _params.passthrough || {});
				if (_params.done) {
					_params.done(_params.passthrough || {});
				}
			} else {
				return _data;
			}

		};

		if (_params.ondatastream) {
			xhr.ondatastream = function(_event) {
				if (_params.ondatastream) {
					_params.ondatastream(_event.progress);
				}
			};
		}

		/**
		 * Error handling
		 * @param {Object} _event The callback object
		 * @ignore
		 */
		xhr.onerror = function(_event) {
			logger.error("HTTP.error " + _event.code + " - " + _event.error);
			if (_params.failure) {
				_params.failure(_event, _params.passthrough || {});
				if (_params.done) {
					_params.done(_params.passthrough || {});
				}
			}
		};

		_params.type = _params.type ? _params.type : "GET";
		_params.async = _params.async ? _params.async : true;

		xhr.open(_params.type, _params.url, _params.async);

		if (_params.headers) {
			for (var i = 0,
			    len = _params.headers.length; i < len; i++) {
				xhr.setRequestHeader(_params.headers[i].key, _params.headers[i].value);
			}
		}

		// Overcomes the 'unsupported browser' error sometimes received
		// xhr.setRequestHeader("User-Agent", "Appcelerator Titanium/" + Ti.version + " (" + Ti.Platform.osname + "/" + Ti.Platform.version + "; " + Ti.Platform.name + "; " + Ti.Locale.currentLocale + ";)");

		if (_params.data) {
			logger.debug("HTTP.data " + _params.data);
			xhr.send(_params.data);
		} else {
			xhr.send();
		}

	} else {

		logger.debug("No internet connection");

		if (_params.failure) {
			_params.failure(_params.passthrough || {});
			if (_params.done) {
				_params.done(_params.passthrough || {});
			}
		}
	}
};
