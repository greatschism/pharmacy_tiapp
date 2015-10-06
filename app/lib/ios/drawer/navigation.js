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

var TAG = "navigation",
    Alloy = require("alloy"),
    _ = require("alloy/underscore")._;

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
	 * Open a screen controller
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

		if (params.stack && that.navigationWindow) {
			return that.push(params);
		}

		that.isBusy = true;

		that.controllers = [];

		that.currentController = Alloy.createController("drawer/window", params);

		that.navigationWindow = Ti.UI.iOS.createNavigationWindow({
			window : that.currentController.getView()
		});

		that.drawer.setCenterWindow(that.navigationWindow);

		that.controllers.push(that.currentController);

		that.isBusy = false;

		return that.currentController;
	};

	/**
	 * Open a detail screen controller
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

		var controller = Alloy.createController("drawer/window", params),
		    window = controller.getView();

		window.addEventListener("open", function didOpen(e) {
			window.removeEventListener("open", didOpen);
			that.currentController.getView().fireEvent("blur");
			that.controllers.push(controller);
			that.currentController = controller;
			that.isBusy = false;
		});

		that.navigationWindow.openWindow(window);

		return controller;
	};

	/**
	 * closes a controller
	 * @param {Number} count No. of pages to close (optional)
	 * @return {Controller} Returns the current controller
	 */
	this.close = function(count) {

		if (that.isBusy || that.controllers.length == 1) {
			return;
		}

		that.isBusy = true;

		var len = that.controllers.length,
		    count = (count || 1) >= len ? len - 1 : (count || 1),
		    removeControllers = that.controllers.splice(len - count, count);

		for (var i = 0,

		    x = removeControllers.length - 1; i < x; i++) {

			removeControllers[i].getView().close();
		}

		var window = that.currentController.getView();

		that.currentController = that.controllers[that.controllers.length - 1];

		window.addEventListener("close", function didClose(e) {
			window.removeEventListener("close", didClose);
			that.currentController.getView().fireEvent("focus");
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
			logger.debug(TAG, "stack index", i, that.controllers[i].__controllerPath);
		}
	};
}

// Calling this module function returns a new navigation instance
module.exports = function(args) {
	return new Navigation(args);
};
