/**
 * ios uses com.mfogg.barcode module
 * A zbar barcode reader
 */

var TAG = "BARC",
    Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    BarcodeModule = require("com.mfogg.barcode"),
    logger = require("logger"),
    isBusy = false,
    keepOpen = false,
    supportedFormats = ["EAN2", "EAN5", "EAN8", "UPCE", "ISBN10", "UPCA", "EAN13", "ISBN13", "COMPOSITE", "I25", "DATABAR", "DATABAR_EXP", "CODE39", "PDF417", "CODE93", "CODE128"],
    successCallback;

var BarcodeReader = {

	values : [],

	capture : function($, options) {

		if (isBusy) {
			logger.error(TAG, "barcode capture is already in progress");
			return false;
		}

		if (!$) {
			logger.error(TAG, "controller reference should be passed to create default scan rectangle and overlay");
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

		BarcodeReader.__window = $.UI.create("Window", {
			apiName : "Window",
			statusBarStyle : Ti.UI.iPhone.StatusBar.LIGHT_CONTENT
		});

		BarcodeReader.__cameraView = BarcodeModule.createView({
			width : Ti.UI.FILL,
			height : Ti.UI.FILL,
			barcodes : options.acceptedFormats || supportedFormats
		});

		BarcodeReader.__cameraView.addEventListener("success", BarcodeReader.successEvt);

		BarcodeReader.__window.add(BarcodeReader.__cameraView);

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
				classes : ["margin-left", "marin-top-extra-large", "right-disabled", "i5", "txt-left", "primary-light-fg-color", "bg-color-disabled", "border-disabled", "icon-back"]
			}),
			    titleLbl = $.UI.create("Label", {
				classes : ["margin-bottom", "margin-left-extra-large", "margin-right-extra-large", "h3", "txt-center", "inactive-fg-color"],
				text : Alloy.Globals.strings.barcodeLblTitle
			});
			navIconBtn.addEventListener("click", BarcodeReader.cancel);
			navbarView.add(navIconBtn);
			overlayView.add(titleLbl);
			overlayView.add(navbarView);
			BarcodeReader.__window.add(overlayView);
		}

		/**
		 *  show the simulated scan box
		 */
		if (options.showRectangle !== false) {
			BarcodeReader.__window.add($.UI.create("View", {
				classes : ["width-85", "height-40", "negative-border", "thick-border", "border-radius-disabled"]
			}));
		}

		BarcodeReader.__window.open({
			modal : true
		});
	},

	cancel : function() {

		if (!isBusy) {
			logger.error(TAG, "capture should be called before cancel");
			return false;
		}

		BarcodeReader.__cameraView.removeEventListener("success", BarcodeReader.successEvt);

		BarcodeReader.__window.close();

		//nullify instances
		BarcodeReader.__window = BarcodeReader.__cameraView = null;

		isBusy = false;
	},

	/**
	 * success event listener
	 */
	successEvt : function(evt) {
		if (keepOpen) {
			/**
			 * if keepOpen is true store the codes after duplicate check
			 * and don't invoke success callback
			 */
			if (_.indexOf(BarcodeReader.values, evt.data) == -1) {
				BarcodeReader.values.push(evt.data);
			}
		} else {

			BarcodeReader.cancel();

			/**
			 *  to match android
			 *  ti.barcode
			 */
			if (successCallback) {
				successCallback({
					result : evt.data
				});
			}
		}
	}
};

module.exports = BarcodeReader;
