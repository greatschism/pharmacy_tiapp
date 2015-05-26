/**
 * HTTP request class
 *
 * @class http
 */
var logger = require("logger");

/**
 * Standard HTTP Request
 * @param {Object} params The arguments for the method
 * @param {Number} params.timeout Timeout time, in milliseconds
 * @param {String} params.type Type of request, "GET", "POST", etc
 * @param {String} params.format Format of return data, one of "JSON", "TEXT", "XML" or "DATA"
 * @param {String} params.url The URL source to call
 * @param {Array} params.headers Array of request headers to send
 * @param {Object|String} params.data The data to send
 * @param {Function} params.failure A function to execute when there is an XHR error
 * @param {Function} params.success A function to execute when when successful
 * @param {Function} params.done A function to execute after the success or failure callback
 * @param {Object} params.passthrough Parameters to pass through to the failure or success callback
 */
exports.request = function(params) {

	logger.debug("HTTP.request " + params.url);

	if (Ti.Network.online) {

		var xhr = Ti.Network.createHTTPClient();

		xhr.timeout = params.timeout ? params.timeout : 10000;

		/**
		 * Data return
		 * @param {Object} data The HTTP SuccessResponse object
		 * @ignore
		 */
		xhr.onload = function(response) {

			logger.debug("HTTP.response " + (this.responseText || "No response or unable to parse the response"));

			var data;

			switch((params.format || "").toLowerCase()) {
			case "data":
				data = this.responseData || this.responseText || "{}";
				break;
			case "xml":
				data = this.responseXML || Ti.XML.parseString(this.responseText || "<response />");
				break;
			case "json":
				data = JSON.parse(this.responseText || "{}");
				break;
			case "text":
			default:
				data = this.responseText || "";
			}

			if (params.success) {
				params.success(data, params.passthrough || {});
				if (params.done) {
					params.done(params.passthrough || {});
				}
			} else {
				return data;
			}

		};

		if (params.ondatastream) {
			xhr.ondatastream = function(event) {
				if (params.ondatastream) {
					params.ondatastream(event.progress);
				}
			};
		}

		/**
		 * Error handling
		 * @param {Object} event The callback object
		 * @ignore
		 */
		xhr.onerror = function(event) {
			logger.error("HTTP.error " + event.code + " - " + event.error);
			if (params.failure) {
				params.failure(event, params.passthrough || {});
				if (params.done) {
					params.done(params.passthrough || {});
				}
			}
		};

		params.type = params.type ? params.type : "GET";
		params.async = params.async ? params.async : true;

		xhr.open(params.type, params.url, params.async);

		_.each(params.headers || [], function(header) {
			xhr.setRequestHeader(header.key, header.value);
		});

		// Overcomes the 'unsupported browser' error sometimes received
		// xhr.setRequestHeader("User-Agent", "Appcelerator Titanium/" + Ti.version + " (" + Ti.Platform.osname + "/" + Ti.Platform.version + "; " + Ti.Platform.name + "; " + Ti.Locale.currentLocale + ";)");

		if (params.data) {
			logger.debug("HTTP.data " + params.data);
			xhr.send(params.data);
		} else {
			xhr.send();
		}

	} else {

		logger.debug("No internet connection");

		if (params.failure) {
			params.failure({
				code : 1007,
				error : "No network connection. No network."
			}, params.passthrough || {});
			if (params.done) {
				params.done(params.passthrough || {});
			}
		}
	}
};
