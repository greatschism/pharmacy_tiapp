/**
 * HTTP request class
 *
 * @class http
 */
var TAG = "http",
    _ = require("alloy/underscore")._,
    logger = require("logger");

/**
 * Standard HTTP Request
 * @param {Object} args The arguments for the method
 * @param {Number} args.timeout Timeout time, in milliseconds
 * @param {String} args.type Type of request, "GET", "POST", etc
 * @param {String} args.format Format of return data, one of "JSON", "TEXT", "XML" or "DATA"
 * @param {String} args.url The URL source to call
 * @param {Array} args.headers Array of request headers to send
 * @param {Object|String} args.params The data to send
 * @param {Function} args.failure A function to execute when there is an XHR error
 * @param {Function} args.success A function to execute when when successful
 * @param {Function} args.done A function to execute after the success or failure callback
 * @param {Object} args.passthrough Parameters to pass through to the failure or success callback
 */
exports.request = function(args) {

	logger.debug(TAG, "request", args.url);

	if (Ti.Network.online) {

		var xhr = Ti.Network.createHTTPClient();

		xhr.timeout = args.timeout ? args.timeout : 10000;

		/**
		 * Data return
		 * @param {Object} data The HTTP SuccessResponse object
		 * @ignore
		 */
		xhr.onload = function(response) {

			logger.debug(TAG, "onload");

			var data;

			switch((args.format || "").toLowerCase()) {
			case "data":
				data = this.responseData || this.responseText || "{}";
				break;
			case "xml":
				data = this.responseXML || Ti.XML.parseString(this.responseText || "<response />");
				break;
			case "json":
				data = JSON.parse(this.responseText || "{}");
				break;
			default:
				data = this.responseText || "";
			}

			if (args.success) {
				args.success(data, args.passthrough || {});
				if (args.done) {
					args.done(args.passthrough || {});
				}
			} else {
				return data;
			}

		};

		if (args.ondatastream) {
			xhr.ondatastream = function(event) {
				if (args.ondatastream) {
					args.ondatastream(event.progress);
				}
			};
		}

		/**
		 * Error handling
		 * @param {Object} event The callback object
		 * @ignore
		 */
		xhr.onerror = function(event) {
			logger.error(TAG, "error", event.code, event.error);
			if (args.failure) {
				args.failure(event, args.passthrough || {});
				if (args.done) {
					args.done(args.passthrough || {});
				}
			}
		};

		args.type = args.type ? args.type : "GET";
		args.async = args.async ? args.async : true;

		xhr.open(args.type, args.url, args.async);

		_.each(args.headers || [], function(header) {
			xhr.setRequestHeader(header.key, header.value);
		});

		// Overcomes the 'unsupported browser' error sometimes received
		// xhr.setRequestHeader("User-Agent", "Appcelerator Titanium/" + Ti.version + " (" + Ti.Platform.osname + "/" + Ti.Platform.version + "; " + Ti.Platform.name + "; " + Ti.Locale.currentLocale + ";)");

		if (args.params) {
			logger.debug(TAG, "params", args.params);
			xhr.send(args.params);
		} else {
			xhr.send();
		}

	} else {

		logger.debug(TAG, "No internet connection");

		if (args.failure) {
			args.failure({
				code : 1007,
				error : "No network connection. No network."
			}, args.passthrough || {});
			if (args.done) {
				args.done(args.passthrough || {});
			}
		}
	}
};
