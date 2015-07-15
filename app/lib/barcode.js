var TAG = "barcode",
    Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    BarcodeModule = require("ti.barcode"),
    logger = require("logger"),
    isBusy = false,
    keepOpen = false,
    successCallback,
    errorCallback,
    cancelCallback;

var BarcodeReader = {

	values : [],

	applyProperties : function(options) {
		_.each(["allowRotation", "allowMenu", "allowInstructions", "displayedMessage", "useFrontCamera", "useLED"], function(key) {
			if (_.has(options, key)) {
				BarcodeModule[key] = options[key];
			}
		});
	},

	capture : function(options) {

		if (isBusy) {
			logger.error(TAG, "barcode capture is already in progress");
			return false;
		}

		isBusy = true;

		options = options || {};

		/**
		 * reset values from previous capture
		 */
		BarcodeReader.values = [];

		if (_.has(options, "success")) {
			successCallback = options.success;
		}

		if (_.has(options, "error")) {
			errorCallback = options.success;
		}

		if (_.has(options, "cancel")) {
			cancelCallback = options.cancel;
		}

		BarcodeModule.addEventListener("success", BarcodeReader.successEvt);
		BarcodeModule.addEventListener("cancel", BarcodeReader.cancelEvt);
		BarcodeModule.addEventListener("error", BarcodeReader.errorEvt);

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
				classes : ["barcode-title"],
				text : Alloy.Globals.strings.msgBarcode
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
				options.acceptedFormats[key] = BarcodeModule[val];
			});
		}

		/**
		 * keepOpen is false by default with ti.barcode
		 * if set explicitly store the value in a variable for later use
		 */
		keepOpen = options.keepOpen || false;

		/**
		 * start scanning
		 */
		BarcodeModule.capture(options);
	},

	cancel : function() {

		if (!isBusy) {
			logger.error(TAG, "capture should be called before cancel");
			return false;
		}

		BarcodeModule.removeEventListener("success", BarcodeReader.successEvt);
		BarcodeModule.removeEventListener("cancel", BarcodeReader.cancelEvt);
		BarcodeModule.removeEventListener("error", BarcodeReader.errorEvt);

		isBusy = false;
		/**
		 * calling the actual cancel method of barcode module
		 */
		BarcodeModule.cancel();
	},

	/**
	 * success event listener
	 */
	successEvt : function(evt) {
		if (keepOpen) {
			/**
			 * if keepOpen is true store the codes and don't invoke success callback
			 *
			 * if contentType is TEXT || URL,
			 * then check for duplicates and add the result to array
			 * else add data to array
			 */
			if ((evt.contentType == BarcodeModule.TEXT || evt.contentType == BarcodeModule.URL) && _.indexOf(BarcodeReader.values, event.result) == -1) {
				BarcodeReader.values.push(event.result);
			} else {
				BarcodeReader.values.push(event.data);
			}
		} else {

			BarcodeModule.removeEventListener("success", BarcodeReader.successEvt);
			BarcodeModule.removeEventListener("cancel", BarcodeReader.cancelEvt);
			BarcodeModule.removeEventListener("error", BarcodeReader.errorEvt);

			isBusy = false;

			if (successCallback) {
				successCallback(evt);
			}
		}
	},

	/**
	 * cancel event listener
	 * occurs when not cancelled through this instance
	 * but cancelled through BarcodeModule or any other interruption like android back button
	 */
	cancelEvt : function(evt) {

		BarcodeModule.removeEventListener("success", BarcodeReader.successEvt);
		BarcodeModule.removeEventListener("cancel", BarcodeReader.cancelEvt);
		BarcodeModule.removeEventListener("error", BarcodeReader.errorEvt);

		isBusy = false;

		if (cancelCallback) {
			cancelCallback(evt);
		}
	},

	/**
	 * error event listener
	 */
	errorEvt : function(evt) {
		if (errorCallback) {
			errorCallback(evt);
		} else {
			/**
			 * clear everything when there is no error callback
			 */
			BarcodeReader.cancel();
			/**
			 * show the error message to user
			 */
			require("uihelper").showDialog({
				message : evt.message
			});
		}
	}
};

module.exports = BarcodeReader;
