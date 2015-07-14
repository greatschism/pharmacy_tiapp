var TAG = "barcode",
    Barcode = require("ti.barcode"),
    _ = require("alloy/underscore")._,
    logger = require("logger");

function BarcodeReader(args) {

	var that = this,
	    keepOpen = true,
	    successCallback,
	    errorCallback,
	    cancelCallback;

	/**
	 * success event listener
	 */
	var success = function(evt) {
		if (evt.contentType == Barcode.TEXT && _.indexOf(that.values, event.result) == -1) {
			that.values.push(event.result);
		}
		if (!keepOpen) {
			Barcode.removeEventListener("success", success);
			Barcode.removeEventListener("cancel", cancel);
			Barcode.removeEventListener("error", error);
		}
		/**
		 * should invoke callback after removing event listeners
		 * to prevent any redundant events callbacks
		 */
		if (successCallback) {
			successCallback(evt);
		}
		if (!keepOpen) {
			cancelCallback = errorCallback = successCallback = cancel = error = success = null;
		}
	};

	/**
	 * error event listener
	 */
	var error = function(evt) {
		if (errorCallback) {
			errorCallback(evt);
		}
	};

	/**
	 * cancel event listener
	 */
	var cancel = function(evt) {
		/**
		 *  occurs when not cancelled through this instance
		 * but cancelled through module or any other interruption
		 */
		Barcode.removeEventListener("success", success);
		Barcode.removeEventListener("cancel", cancel);
		Barcode.removeEventListener("error", error);
		/**
		 * should invoke callback after removing event listeners
		 * to prevent any redundant events callbacks
		 */
		if (cancelCallback) {
			cancelCallback(evt);
		}
		cancelCallback = errorCallback = successCallback = cancel = error = success = null;
	};

	/**
	 * captured codes with no duplicates
	 * only result with content type Barcode.TEXT is stored
	 * any other items should be
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
				 * has to be converted to actual constant
				 */
				_.each(options.acceptedFormats, function(val, key) {
					options.acceptedFormats[key] = Barcode[val];
				});
			}
			/**
			 * keepOpen is false by default
			 * we keep it true if it is not set explicitly
			 */
			if (!_.has(options, "keepOpen")) {
				options.keepOpen = keepOpen;
			} else {
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
