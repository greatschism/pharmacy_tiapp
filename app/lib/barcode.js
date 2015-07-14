var TAG = "barcode",
    Barcode = require("ti.barcode"),
    _ = require("alloy/underscore")._,
    logger = require("logger");

function BarcodeReader(args) {

	var that = this,
	    keepOpen = false,
	    successCallback,
	    errorCallback,
	    cancelCallback;

	/**
	 * success event listener
	 */
	var success = function(evt) {
		if (keepOpen) {
			/**
			 * if keepOpen is true store the codes and don't invoke success callback
			 *
			 * if contentType is Barcode.TEXT || Barcode.URL,
			 * then check for duplicates and add the result to array
			 * else add data to array
			 */
			if ((evt.contentType == Barcode.TEXT || evt.contentType == Barcode.URL) && _.indexOf(that.values, event.result) == -1) {
				that.values.push(event.result);
			} else {
				that.values.push(event.data);
			}
		} else {
			Barcode.removeEventListener("success", success);
			Barcode.removeEventListener("cancel", cancel);
			Barcode.removeEventListener("error", error);
			/**
			 * should invoke callback after removing event listeners
			 * to prevent any redundant events callback
			 */
			if (successCallback) {
				successCallback(evt);
			}
			cancelCallback = errorCallback = successCallback = cancel = error = success = null;
		}
	};

	/**
	 * error event listener
	 */
	var error = function(evt) {
		if (errorCallback) {
			errorCallback(evt);
		} else {
			/**
			 * clear everything when there is no error callback
			 */
			that.cancel();
			/**
			 * show the error message to user
			 */
			require("uihelper").showDialog({
				message : evt.message
			});
		}
	};

	/**
	 * cancel event listener
	 */
	var cancel = function(evt) {
		/**
		 *  occurs when not cancelled through this instance
		 * but cancelled through module or any other interruption like android back button
		 */
		Barcode.removeEventListener("success", success);
		Barcode.removeEventListener("cancel", cancel);
		Barcode.removeEventListener("error", error);
		/**
		 * should invoke callback after removing event listeners
		 * to prevent any redundant events callback
		 */
		if (cancelCallback) {
			cancelCallback(evt);
		}
		cancelCallback = errorCallback = successCallback = cancel = error = success = null;
	};

	/**
	 * captured codes are stored in this array
	 * when keepOpen is true
	 */
	this.values = [];

	/**
	 *  apply properties
	 */
	this.applyProperties = function(options) {
		_.each(["allowRotation", "allowMenu", "allowInstructions", "displayedMessage", "useFrontCamera", "useLED"], function(key) {
			if (_.has(options, key)) {
				Barcode[key] = options[key];
			}
		});
		if (_.has(options, "success")) {
			successCallback = options.success;
		}
		if (_.has(options, "error")) {
			errorCallback = options.success;
		}
		if (_.has(options, "cancel")) {
			cancelCallback = options.cancel;
		}
		options = null;
	};

	/**
	 * $ - should the controller which calls this function
	 * this is used to create the default overlay with right classes
	 * from tss
	 */
	this.capture = function(options, $) {
		if (!success) {
			logger.error(TAG, "capture", "this instance of barcode no longer valid, should create a new instance and use it");
		} else {
			Barcode.addEventListener("success", success);
			Barcode.addEventListener("cancel", cancel);
			Barcode.addEventListener("error", error);
			options = options || {};
			/**
			 * show default overlay when no overlay is passed
			 * and overlayEnabled is not false
			 */
			if (!options.overlay && $ && options.overlayEnabled !== false) {
				var overlayView = Ti.UI.createView({
					top : 0,
					right : 0,
					bottom : 0,
					left : 0,
					backgroundColor : "transparent"
				}),
				    navbarView = $.UI.create("View", {
					classes : ["barcode-navbar"]
				}),
				    navIconBtn = $.UI.create("Button", {
					classes : ["barcode-navbar-icon", "icon-back"]
				}),
				    titleLbl = $.UI.create("Label", {
					classes : ["barcode-title"]
				});
				navIconBtn.addEventListener("click", that.cancel);
				navbarView.add(navIconBtn);
				overlayView.add(titleLbl);
				overlayView.add(navbarView);
				options.overlay = overlayView;
			}
			if (options.acceptedFormats) {
				/**
				 * accepted formats will be a array of strings
				 * eg: ["FORMAT_QR_CODE", "FORMAT_DATA_MATRIX"]
				 * transformed to actual constant
				 */
				_.each(options.acceptedFormats, function(val, key) {
					options.acceptedFormats[key] = Barcode[val];
				});
			}
			/**
			 * keepOpen is false by default with ti.barcode
			 * if set explicitly store the value in a variable for later use
			 */
			if (_.has(options, "keepOpen")) {
				keepOpen = options.keepOpen;
			}
			/**
			 * start scanning
			 */
			Barcode.capture(options);
		}
	};

	this.cancel = function(evt) {
		if (!success) {
			logger.error(TAG, "cancel", "this instance of barcode no longer valid, should create a new instance and use it");
		} else {
			Barcode.removeEventListener("success", success);
			Barcode.removeEventListener("cancel", cancel);
			Barcode.removeEventListener("error", error);
			cancelCallback = errorCallback = successCallback = cancel = error = success = null;
			Barcode.cancel();
		}
	};

	/**
	 *  process properties sent with constructor
	 */
	if (args) {
		that.applyProperties(args);
	}
}

// Calling this module function returns a new BarcodeReader instance
module.exports = function(args) {
	return new BarcodeReader(args);
};
