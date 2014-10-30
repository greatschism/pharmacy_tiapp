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
var Alloy = require("alloy");

var App = {

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
		orientation : Ti.Gesture.orientation == Ti.UI.LANDSCAPE_LEFT || Ti.Gesture.orientation == Ti.UI.LANDSCAPE_RIGHT ? "landscape" : "portrait"
	},

	/**
	 * The navigator object which handles all navigation
	 * @type {Object}
	 */
	navigator : {},

	/**
	 * The global window used in the app
	 * @type {Object}
	 */
	globalWindow : {},

	/**
	 * Sets up the app singleton and all it's child dependencies.
	 * **NOTE: This should only be fired only once.**
	 */
	init : function(_params) {

		// Global system Events
		Ti.Network.addEventListener("change", App.networkChange);
		Ti.App.addEventListener("pause", App.exit);
		Ti.App.addEventListener("close", App.exit);
		Ti.App.addEventListener("resumed", App.resume);
		Ti.Gesture.addEventListener("orientationchange", App.orientationChange);

		if (OS_ANDROID) {
			Ti.Android.currentActivity.addEventListener("resume", App.resume);
			App.globalWindow.addEventListener("androidback", App.back);
		}

		// Get device dimensions
		App.getDeviceDimensions();
	},

	/**
	 * Unset the app singleton and all it's child dependencies.
	 * **NOTE: This should only be fired only once after init.**
	 */
	terminate : function() {
		// Global system Events
		Ti.Network.removeEventListener("change", App.networkChange);
		Ti.App.removeEventListener("pause", App.exit);
		Ti.App.removeEventListener("close", App.exit);
		Ti.App.removeEventListener("resumed", App.resume);
		Ti.Gesture.removeEventListener("orientationchange", App.orientationChange);

		if (OS_ANDROID) {
			Ti.Android.currentActivity.removeEventListener("resume", App.resume);
			App.globalWindow.removeEventListener("androidback", App.back);
		}

		App.navigator = {};
	},

	/**
	 * initiate the navigator object
	 * @param {Object} _params the argument for the navigator
	 * @param {String} _params.type type of navigator (required by the init method to determine what navigator to use)
	 */
	setNavigator : function(_params) {
		_.extend(_params, {
			window : App.globalWindow,
			device : App.device
		});
		// Require in the navigation module
		App.navigator = require(String(_params.type).concat("/navigation"))(_params);
	},

	/**
	 * Helper to bind the orientation events to a controller.
	 *
	 * **NOTE** It is VERY important this is
	 * managed right because we're adding global events. They must be removed
	 * or a leak can happen because of all the closures. We could slightly
	 * reduce the closures if we placed these in the individual controllers
	 * but then we're duplicating code. This keeps the controllers clean. Currently,
	 * this method will _add_ and _remove_ the global events, so things should go
	 * out of scope and GC'd correctly.
	 *
	 * @param {Controllers} _controller The controller to bind the orientation events
	 */
	bindOrientationEvents : function(_controller) {
		_controller.window.addEventListener("close", function() {
			if (_controller.handleOrientation) {
				Ti.App.removeEventListener("orientationChange", _controller.handleOrientation);
			}
		});

		_controller.window.addEventListener("open", function() {
			Ti.App.addEventListener("orientationChange", function(_event) {
				if (_controller.handleOrientation) {
					_controller.handleOrientation(_event);
				}

				App.setViewsForOrientation(_controller);
			});
		});
	},

	/**
	 * Update views for current orientation helper
	 *
	 * We're doing this because Alloy does not have support for
	 * orientation support in tss files yet. In order not to duplicate
	 * a ton of object properties, hardcode them, etc. we're using this method.
	 *
	 * Once Alloy has orientation support (e.g. `#myElement[orientation=landscape]`), this
	 * can be removed and the tss reworked.
	 *
	 * All that has to be done is implement the following structure in a `.tss` file:
	 * 		"#myElement": {
	 * 			landscape: { backgroundColor: "red" },
	 * 			portrait: { backgroundColor: "green" }
	 * 		}
	 *
	 * @param {Controllers} _controller
	 */
	setViewsForOrientation : function(_controller) {
		if (!App.device.orientation) {
			return;
		}

		// Restricted the UI for portrait and landscape orientation
		if (App.device.orientation == "portrait" || App.device.orientation == "landscape") {
			for (var view in _controller.__views) {
				if (_controller.__views[view][App.device.orientation] && typeof _controller.__views[view].applyProperties == "function") {
					_controller.__views[view].applyProperties(_controller.__views[view][App.device.orientation]);
				} else if (_controller.__views[view].wrapper && _controller.__views[view].wrapper[App.device.orientation] && typeof _controller.__views[view].applyProperties == "function") {
					_controller.__views[view].applyProperties(_controller.__views[view].wrapper[App.device.orientation]);
				}
			}
		}
	},

	/**
	 * Global network event handler
	 * @param {Object} _event Standard Ti callback
	 */
	networkChange : function(_event) {

	},

	/**
	 * Exit event observer
	 * @param {Object} _event Standard Ti callback
	 */
	exit : function(_event) {

	},

	/**
	 * Resume event observer
	 * @param {Object} _event Standard Ti callback
	 */
	resume : function(_event) {

	},

	/**
	 * Android Back Button event observer
	 * @param {Object} _event Standard Ti callback
	 */
	back : function(_event) {
		App.navigator.close(1, null, true);
	},

	/**
	 * Handle the orientation change event callback
	 * @param {Object} _event Standard Ti Callback
	 */
	orientationChange : function(_event) {
		// Ignore face-up, face-down and unknown orientation
		if (_event.orientation === Titanium.UI.FACE_UP || _event.orientation === Titanium.UI.FACE_DOWN || _event.orientation === Titanium.UI.UNKNOWN) {
			return;
		}

		App.device.orientation = _event.source.isLandscape() ? "landscape" : "portrait";

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
			App.device.width = (App.device.width / (App.device.dpi / 160));
			App.device.height = (App.device.height / (App.device.dpi / 160));
		}

		return {
			width : App.device.width,
			height : App.device.height
		};
	}
};

module.exports = App;
