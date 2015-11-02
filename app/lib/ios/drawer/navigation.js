/**
 * Stack-based navigation module which manages the navigation state and such for an app.
 * This particular module manages a stack of views added to a specific parent
 * most common in a one-window architecture.
 *
 * @class Navigation
 */

/**
 * The Navigation object
 * @param {Object} args
 * @param {Object} args.window The parent which this navigation stack will belong
 * @param {Object} args.drawer drawer control
 * @constructor
 */

var TAG = "NAVI",
    Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    analytics = require("analytics"),
    ctrlShortCode = require("ctrlShortCode");

function Navigation(args) {

	var that = this;

	args = args || {};

	/**
	 * Whether or not the navigation module is busy opening/closing a screen
	 * @type {Boolean}
	 */
	this.isBusy = false;

	/**
	 * name of the navigator
	 * @type {String}
	 */
	this.name = "drawer";

	/**
	 * The controller stack
	 * @type {Array}
	 */
	this.controllers = [];

	/**
	 * The current controller object reference
	 * @type {Controller}
	 */
	this.currentController = {};

	/**
	 * controller that blocks ui from user interaction
	 * @type {Controllers}
	 */
	this.loader = null;

	/**
	 * The drawer object
	 * @type {Object}
	 */
	this.drawer = args.drawer;

	/**
	 * The navigation window object
	 * @type {Object}
	 */
	this.navigationWindow = args.navigationWindow;

	/**
	 * The root window object
	 * @type {Object}
	 */
	this.rootWindow = args.rootWindow;

	/**
	 * Tells whether root window's action bar is hidden or not
	 * @type {Boolean}
	 */
	this.rootNavBarHidden = false;

	/**
	 * Opens a new top level controller
	 * @param {Object} params The arguments for the method
	 * @param {String} params.ctrl name of the Controller to be opened
	 * @param {String} params.title title to be displayed on the title bar
	 * @param {String} params.titleid localized title to be displayed on the title bar, ignored if title is set
	 * @param {String} params.navBarHidden hides navigation bar when true
	 * @param {Object} params.ctrlArguments arguments to be passed to the new controller
	 * @return {Controller} Returns the new controller
	 */
	this.open = function(params) {

		if (that.isBusy) {
			return;
		}

		analytics.navEvent(that.currentController.shortCode || TAG, ctrlShortCode[params.ctrl]);

		if (params.stack) {
			return that.push(params);
		}

		that.isBusy = true;

		that.currentController = Alloy.createController("drawer/view", params);

		that.currentController.init();

		that.rootWindow.add(that.currentController.getView());

		that.currentController.focus();

		var len = that.controllers.length;

		if (len) {

			if (len > 1) {
				var count = len - 1,
				    removeControllers = that.controllers.splice(len - count, count);
				for (var i = 0,
				    x = removeControllers.length - 1; i < x; i++) {
					removeControllers[i].getView().close();
				}
				//close last window at top
				that.navigationWindow.closeWindow(removeControllers.pop().getView());
			}

			//remove existing views in root window
			var masterController = that.controllers.pop();
			masterController.terminate();
			that.rootWindow.remove(masterController.getView());
		}

		that.controllers.push(that.currentController);

		that.isBusy = false;

		//that.testOutput();

		return that.currentController;
	};

	/**
	 * Opens a new detail controller
	 * @param {Object} params The arguments for the method
	 * @param {String} params.ctrl name of the Controller to be opened
	 * @param {String} params.title title to be displayed on the title bar
	 * @param {String} params.titleid localized title to be displayed on the title bar, ignored if title is set
	 * @param {String} params.navBarHidden hides navigation bar when true
	 * @param {Object} params.ctrlArguments arguments to be passed to the new controller
	 * @param {Object} params.stack should be true always
	 * @return {Controller} Returns the new controller
	 */
	this.push = function(params) {

		if (that.isBusy) {
			return;
		}

		that.isBusy = true;

		that.currentController = Alloy.createController("drawer/window", params);

		that.currentController.init();

		that.controllers.push(that.currentController);

		var window = that.currentController.getView();

		window.addEventListener("open", function didOpenWindow(e) {
			window.removeEventListener("open", didOpenWindow);
			that.controllers[that.controllers.length - 2].blur();
			that.isBusy = false;
		});

		that.navigationWindow.openWindow(window);

		//that.testOutput();

		return that.currentController;
	};

	/**
	 * closes a controller
	 * @param {Number} count No. of pages to close (optional)
	 * @return {Controller} Returns the current controller
	 */
	this.close = function(count) {

		var len = that.controllers.length;

		if (that.isBusy || len == 1) {
			return;
		}

		that.isBusy = true;

		if (!count) {
			count = 1;
		}

		if (count >= len) {
			count = len - 1;
		}

		var removeControllers = that.controllers.splice(len - count, count);
		for (var i = 0,
		    x = removeControllers.length - 1; i < x; i++) {
			removeControllers[i].getView().close();
		}

		var from = that.currentController.shortCode,
		    window = that.currentController.getView();

		that.currentController = that.controllers[that.controllers.length - 1];

		analytics.navEvent(from, that.currentController.shortCode);

		window.addEventListener("close", function didCloseWindow(e) {
			window.removeEventListener("close", didCloseWindow);
			that.currentController.focus();
			that.isBusy = false;
		});

		that.navigationWindow.closeWindow(window);

		//that.testOutput();

		return that.currentController;
	};

	/**
	 * closes all controllers except the first root one
	 */
	this.closeToRoot = function() {

		if (that.isBusy) {
			return;
		}

		return that.close(that.controllers.length);
	};

	/**
	 * close all the windows  including the drawer
	 */
	this.terminate = function() {

		if (that.isBusy) {
			return;
		}

		that.closeToRoot();
		that.controllers.pop().terminate();
		that.drawer.close();
	};

	/**
	 *block ui
	 * @param {String} message
	 */
	this.showLoader = function(message) {

		if (that.loader == null) {

			that.loader = Alloy.createWidget("ti.loading", "widget", {
				message : message || Alloy.Globals.strings.msgLoading
			});
		}
	};

	/**
	 *un-block ui
	 */
	this.hideLoader = function() {

		if (that.loader != null) {

			that.loader.hide();

			that.loader = null;
		}
	};

	/**
	 * set loader message
	 */
	this.setLoaderMessage = function(message) {

		if (that.loader != null) {

			that.loader.setMessage(message);
		}
	};

	/**
	 * Spits information about the navigation stack out to console
	 */
	this.testOutput = function() {

		var logger = require("logger");

		logger.debug(TAG, "stack length", that.controllers.length);

		for (var i = 0,
		    x = that.controllers.length; i < x; i++) {
			logger.debug(TAG, "stack index", i, that.controllers[i].ctrlPath);
		}
	};
}

// Calling this module function returns a new navigation instance
module.exports = function(args) {
	return new Navigation(args);
};
