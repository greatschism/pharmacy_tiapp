/**
 * android uses ti.barcode module
 * A zxing barcode reader
 */

var	app = require("core"),
	TAG = "BARC",
    Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    BarcodeModule = require("ti.barcode"),
    logger = require("logger"),
    isBusy = false,
    keepOpen = false,
    successCallback,
    errorCallback,
    cancelCallback;

/**
 *  set default properties
 *  can be overridden with applyProperties
 *  of BarcodeReader object
 */
BarcodeModule.allowRotation = true;
BarcodeModule.displayedMessage = "";
BarcodeModule.allowInstructions = false;

var BarcodeReader = {

	values : [],

	applyProperties : function(options) {
		_.each(["allowRotation", "allowMenu", "allowInstructions", "displayedMessage", "useFrontCamera", "useLED"], function(key) {
			if (_.has(options, key)) {
				BarcodeModule[key] = options[key];
			}
		});
	},

	capture : function($, options) {

		if (isBusy) {
			logger.error(TAG, "barcode capture is already in progress");
			return false;
		}

		if (!$) {
			logger.error(TAG, "controller reference should be passed to create default overlay");
			return false;
		}

		isBusy = true;

		options = options || {};

		/**
		 * keepOpen is false by default with ti.barcode
		 * if set explicitly store the value in a variable for later use
		 */
		keepOpen = options.keepOpen || false;

		/**
		 * reset values from previous capture
		 */
		BarcodeReader.values = [];

		if (_.has(options, "success")) {
			successCallback = options.success;
			delete options.success;
		}

		if (_.has(options, "error")) {
			errorCallback = options.error;
			delete options.error;
		}

		if (_.has(options, "cancel")) {
			cancelCallback = options.cancel;
			delete options.cancel;
		}

		if (options.acceptedFormats) {
			/**
			 * accepted formats will be a array of strings
			 * eg: ["FORMAT_QR_CODE", "FORMAT_DATA_MATRIX"]
			 * transformed to actual constant
			 */
			var acceptedFormats = [];
			_.each(options.acceptedFormats, function(val) {
				acceptedFormats.push(BarcodeModule[val]);
			});
			options.acceptedFormats = acceptedFormats;
		}

		BarcodeModule.addEventListener("success", BarcodeReader.successEvt);
		BarcodeModule.addEventListener("cancel", BarcodeReader.cancelEvt);
		BarcodeModule.addEventListener("error", BarcodeReader.errorEvt);

		/**
		 * show default overlay when no overlay is passed
		 * and overlayEnabled is not false
		 */
		if (!options.overlay && options.overlayEnabled !== false) {
			var overlayView = Ti.UI.createView({
				backgroundColor : "transparent"
			}),
			    navbarView = $.UI.create("View", {
				classes : ["top", "nav-bar-height", "primary-bg-color"]
			}),
			    navIconBtn = $.UI.create("Button", {
				classes : ["margin-left", "top-disabled", "right-disabled", "i5", "txt-left", "primary-font-color", "bg-color-disabled", "border-disabled", "icon-back"]
			}),
				helpBtn = $.UI.create("Button", {
				classes : ["margin-right", "top-disabled", "i4", "txt-right", "primary-font-color", "border-disabled", "icon-help"]
			}),
			    titleLbl = $.UI.create("Label", {
				classes : ["margin-bottom", "margin-left-extra-large", "margin-right-extra-large", "h3", "txt-center", "inactive-fg-color"],
				text : Alloy.Globals.strings.barcodeLblTitle
			});
			navIconBtn.addEventListener("click", BarcodeReader.cancel);
			helpBtn.addEventListener("click", BarcodeReader.didClickHelp);
			navbarView.add(navIconBtn);
			navbarView.add(helpBtn);
			overlayView.add(titleLbl);
			overlayView.add(navbarView);
			_.extend(options, {
				animate : true,
				showCancel : false,
				overlay : overlayView
			});
		}

		/**
		 * start scanning
		 */
		BarcodeModule.capture(options);
	},

	removeEventListeners : function() {
		BarcodeModule.removeEventListener("success", BarcodeReader.successEvt);
		BarcodeModule.removeEventListener("cancel", BarcodeReader.cancelEvt);
		BarcodeModule.removeEventListener("error", BarcodeReader.errorEvt);
	},

	cancel : function() {

		if (!isBusy) {
			logger.error(TAG, "capture should be called before cancel");
			return false;
		}

		BarcodeReader.removeEventListeners();

		/**
		 * calling the actual cancel method of barcode module
		 */
		BarcodeModule.cancel();

		isBusy = false;
	},
	
	didClickHelp : function(e) {
		BarcodeReader.cancel();
		app.navigator.open({
			titleid : "titleRxSample",
			ctrl : "rxSample",
			stack : true
		});
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
			if ((evt.contentType == BarcodeModule.TEXT || evt.contentType == BarcodeModule.URL) && _.indexOf(BarcodeReader.values, evt.result) == -1) {
				BarcodeReader.values.push(evt.result);
			} else {
				BarcodeReader.values.push(evt.data);
			}
		} else {

			BarcodeReader.removeEventListeners();

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

		BarcodeReader.removeEventListeners();

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
