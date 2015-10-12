/**
 * The main app singleton used throughout the app.  This singleton
 * can manage your navigation flow, special events that happen throughout
 * the app lifecycle, etc.
 *
 * It's important to understand that this should mainly be a simple app singleton
 * for managing global things throughout your app.  i.e. If you want to sanitize
 * some html, you shouldn't put a function to handle that here.
 *
 * @class core
 * @singleton
 */

var Alloy = require("alloy"),
    _ = require("alloy/underscore")._;

var App = {

	/**
	 * flag that tells whether there are any updates to be applied
	 */
	canReload : false,

	/**
	 * callback to be called after app update
	 */
	updateCallback : null,

	/**
	 * Device information, some come from the Ti API calls and can be referenced
	 * from here so multiple bridge calls aren't necessary, others generated here
	 * for ease of calculations and such.
	 *
	 * @type {Object}
	 * @param {String} version The version of the OS
	 * @param {Number} versionMajor The major version of the OS
	 * @param {Number} versionMinor The minor version of the OS
	 * @param {Number} width The width of the device screen
	 * @param {Number} height The height of the device screen
	 * @param {Number} dpi The DPI of the device screen
	 * @param {String} orientation The device orientation, either "landscape" or "portrait"
	 * @param {String} statusBarOrientation A Ti.UI orientation value
	 */
	device : {
		version : Ti.Platform.version,
		versionMajor : parseInt(Ti.Platform.version.split(".")[0], 10),
		versionMinor : parseInt(Ti.Platform.version.split(".")[1], 10),
		width : null,
		height : null,
		dpi : Ti.Platform.displayCaps.dpi,
		logicalDensityFactor : OS_ANDROID ? Ti.Platform.displayCaps.logicalDensityFactor : Ti.Platform.displayCaps.dpi / 160,
		orientation : Ti.Gesture.orientation == Ti.UI.LANDSCAPE_LEFT || Ti.Gesture.orientation == Ti.UI.LANDSCAPE_RIGHT ? "landscape" : "portrait"
	},

	/**
	 * The navigator object which handles all navigation
	 * @type {Object}
	 */
	navigator : {},

	/**
	 * Sets up the app singleton and all it's child dependencies.
	 * **NOTE: This should only be fired only once.**
	 */
	init : function(params) {

		//Global system Events
		/**
		 * Not required since app doesn't support
		 * language orientation for now
		 */
		//Ti.Gesture.addEventListener("orientationchange", App.orientationChange);

		if (_.has(params, "type")) {
			App.setNavigator(params);
		}
	},

	/**
	 * Unset the app singleton and all it's child dependencies.
	 * **NOTE: This should only be fired only once after init.**
	 */
	terminate : function() {

		//Global system Events
		/**
		 * Not required since app doesn't support
		 * language orientation for now
		 */
		//Ti.Gesture.removeEventListener("orientationchange", App.orientationChange);

		App.navigator.terminate();
		App.navigator = {};
	},

	/**
	 * initiate the navigator object
	 * @param {Object} params type of navigator
	 */
	setNavigator : function(params) {
		// Require in the navigation module
		App.navigator = require(String(params.type).concat("/navigation"))(params);
	},

	/**
	 * handles the async update
	 */
	update : function(updateCallback) {
		if (updateCallback) {
			App.updateCallback = updateCallback;
		}
		App.canReload = true;
		require("config").updateResources(App.didUpdate);
	},

	didUpdate : function(errorQueue) {
		if (_.isArray(errorQueue) && errorQueue.length) {
			require("uihelper").showDialog({
				title : Alloy.Globals.strings.dialogTitleUpdates,
				message : Alloy.Globals.strings.msgAppUpdateFailed,
				buttonNames : [Alloy.Globals.strings.dialogBtnContinue]
			});
		} else {
			App.promptAndReloadConfig();
		}
	},

	promptAndReloadConfig : function() {
		require("uihelper").showDialog({
			title : Alloy.Globals.strings.dialogTitleUpdates,
			message : Alloy.CFG.force_reload_after_update ? Alloy.Globals.strings.msgAppUpdatedForceReload : Alloy.Globals.strings.msgAppUpdatedReload,
			buttonNames : Alloy.CFG.force_reload_after_update ? [Alloy.Globals.strings.dialogBtnOK] : [Alloy.Globals.strings.dialogBtnYes, Alloy.Globals.strings.dialogBtnNo],
			cancelIndex : Alloy.CFG.force_reload_after_update ? -1 : 1,
			success : App.reloadConfig
		});
	},

	reloadConfig : function() {
		if (App.canReload) {
			App.canReload = false;
			require("config").load(function() {
				if (App.updateCallback) {
					App.updateCallback();
					App.updateCallback = null;
				}
			});
		}
	},

	/**
	 * Handle the orientation change event callback
	 * @param {Object} event Standard Ti Callback
	 */
	orientationChange : function(event) {

		// Ignore face-up, face-down and unknown orientation
		var orientation = Ti.Gesture.orientation;
		if (orientation === Ti.UI.FACE_UP || orientation === Ti.UI.FACE_DOWN || orientation === Ti.UI.UNKNOWN) {
			return;
		}

		App.device.orientation = Ti.Gesture.isLandscape() ? "landscape" : "portrait";

		// Get device dimensions
		App.getDeviceDimensions();

		/**
		 * Fires an event for orientation change handling throughout the app
		 * @event orientationChange
		 */
		Ti.App.fireEvent("orientationChange", {
			orientation : App.device.orientation
		});
	},

	/**
	 * Determines the device dimensions
	 * @return {Object} Returns the new values of the new {@link core.device.width} & {@link core.device.height} settings
	 */
	getDeviceDimensions : function() {

		// Set device height and width based on orientation
		switch(App.device.orientation) {
		case "portrait":
			App.device.width = Ti.Platform.displayCaps.platformWidth > Ti.Platform.displayCaps.platformHeight ? Ti.Platform.displayCaps.platformHeight : Ti.Platform.displayCaps.platformWidth;
			App.device.height = Ti.Platform.displayCaps.platformWidth > Ti.Platform.displayCaps.platformHeight ? Ti.Platform.displayCaps.platformWidth : Ti.Platform.displayCaps.platformHeight;
			break;
		case "landscape":
			App.device.width = Ti.Platform.displayCaps.platformWidth > Ti.Platform.displayCaps.platformHeight ? Ti.Platform.displayCaps.platformWidth : Ti.Platform.displayCaps.platformHeight;
			App.device.height = Ti.Platform.displayCaps.platformWidth > Ti.Platform.displayCaps.platformHeight ? Ti.Platform.displayCaps.platformHeight : Ti.Platform.displayCaps.platformWidth;
			break;
		}

		// Convert dimensions from DP to PX for Android
		if (OS_ANDROID) {
			App.device.width /= App.device.logicalDensityFactor;
			App.device.height /= App.device.logicalDensityFactor;
		}

		return {
			width : App.device.width,
			height : App.device.height
		};
	}
};

// keep device dimensions ready
App.getDeviceDimensions();

module.exports = App;
