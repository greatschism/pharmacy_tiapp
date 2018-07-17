/**
 * ios uses com.mfogg.squarecamera module
 * A zbar barcode reader
 */

var	app = require("core"),
	TAG = "BARC",
    Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    BarcodeModule = require("com.mfogg.squarecamera"),
    logger = require("logger"),
    isBusy = false,
    keepOpen = false,
    supportedFormats = ["UPCE", "Code39", "Code39Mod43", "EAN13", "EAN8", "Code93", "Code128", "PDF417", "QR", "Aztec", "Interleaved2of5", "ITF14", "DataMatrix"],
    successCallback,
    passthrough,
    flashBtn,
    toggle = 0,
    uihelper = require("uihelper");
	
	
var BarcodeReader = {	
	values : [],

	capture : function($, options) {
		
		if (isBusy) {
			logger.error(TAG, "barcode capture is already in progress");
			return false;
		}
		isFinished = false;

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
		
		if (_.has(options, "passthrough")) {
			passthrough = options.passthrough;
			delete options.passthrough;
		}

		BarcodeReader.__window = $.UI.create("Window", {
			apiName : "Window",
			statusBarStyle : Ti.UI.iOS.StatusBar.LIGHT_CONTENT
		});

		BarcodeReader.__cameraView = BarcodeModule.createView({
			width : Ti.UI.FILL,
			height : Ti.UI.FILL,
			detectCodes: true,
			barcodeTypes : options.acceptedFormats || supportedFormats
		});

		BarcodeReader.__cameraView.addEventListener("code", BarcodeReader.successEvt);

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
				classes : ["margin-left", "marin-top-extra-large", "right-disabled", "i5", "txt-left", "primary-font-color", "bg-color-disabled", "border-disabled", "icon-back"]
			}),
			    helpBtn = $.UI.create("Button", {
				classes : ["left-85", "bottom-0", "top-30", "i4", "primary-font-color", "icon-help", "auto-width","auto-height","border-disabled"]				
			}),
				navTitleLbl = $.UI.create("Label", {
				classes : ["title-control", "txt-center"],
				text : Alloy.Globals.strings.titleRefill
			}),
			    titleLbl = $.UI.create("Label", {
				classes : ["margin-bottom", "margin-left-extra-large", "margin-right-extra-large", "h3", "txt-center", "inactive-fg-color"],
				text : Alloy.Globals.strings.barcodeLblTitle
			});			
				flashBtn = $.UI.create("Button", {
				classes : ["i4", "left-45","bottom-0", "top-30", "fade-half", "primary-font-color", "icon-tip","auto-width","auto-height", "border-disabled"]				
			});
			
			navIconBtn.addEventListener("click", BarcodeReader.cancel);
			helpBtn.addEventListener("click", BarcodeReader.didClickHelp);
			flashBtn.addEventListener("click", BarcodeReader.didClickFlash);
			navbarView.add(flashBtn);
			navbarView.add(helpBtn);
			navbarView.add(navIconBtn);
			if (Ti.App.accessibilityEnabled) {
				navbarView.add(navTitleLbl);
			};
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
		
		uihelper.showDialog({
		message : Alloy.Globals.strings.barcodeScanUserInfo,
		buttonNames : [Alloy.Globals.strings.dialogBtnOK],
		success : BarcodeReader.__window.open()
		});	
	},

	cancel : function() {

		if (!isBusy) {
			logger.error(TAG, "capture should be called before cancel");
			return false;
		}

		BarcodeReader.__cameraView.removeEventListener("code", BarcodeReader.successEvt);

		BarcodeReader.__window.close();

		//nullify instances
		BarcodeReader.__window = BarcodeReader.__cameraView = null;
		
		/**
		 * 	To enable accessibility on Refill screen
		 */
		if (passthrough) {
			passthrough();
		}

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
	
	didClickFlash : function(e){
		var fadeIn = {opacity : 1},
			fadeHalf = {opacity : 0.5};		
		if(toggle){
			flashBtn.applyProperties(fadeHalf);
			toggle = 0;
			BarcodeReader.__cameraView.turnFlashOff();
		}
		else{
			flashBtn.applyProperties(fadeIn);
			toggle = 1;
			BarcodeReader.__cameraView.turnFlashOn();
			
		}		
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
			if (_.indexOf(BarcodeReader.values, evt.values) == -1) {
				BarcodeReader.values.push(evt.values);
			}
		} else {

			BarcodeReader.cancel();

			/**
			 *  to match android
			 *  ti.barcode
			 */
			if (successCallback) {
				successCallback({
					result : evt.value
				});
			}
		}
	}
};

module.exports = BarcodeReader;