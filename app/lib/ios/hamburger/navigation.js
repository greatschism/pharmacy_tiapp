/**
 * Stack-based navigation module which manages the navigation state and such for an app.
 * This particular module manages a stack of views added to a specific parent
 * most common in a one-window architecture.
 *
 * @class Navigation
 */

/**
 * The Navigation object
 * @param {Object} _args
 * @param {Object} _args.window The parent which this navigation stack will belong
 * @param {Object} _args.device device information form core
 * @param {Object} _args.hamburger hamburger control
 * @constructor
 */

var Alloy = require("alloy"),
    _ = require("alloy/underscore")._;

function Navigation(_args) {

	var that = this;

	_args = _args || {};

	/**
	 * Whether or not the navigation module is busy opening/closing a screen
	 * @type {Boolean}
	 */
	this.isBusy = false;

	/**
	 * name of the navigator
	 * @type {String}
	 */
	this.name = "hamburger";

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
	 * The device object
	 * @type {Object}
	 */
	this.device = _args.device;

	/**
	 * The hamburger object
	 * @type {Object}
	 */
	this.drawer = _args.drawer;

	/**
	 * The navigation window object
	 * @type {Object}
	 */
	this.navigationWindow = _args.navigationWindow;

	/**
	 * The root window object
	 * @type {Object}
	 */
	this.rootWindow = _args.rootWindow;

	/**
	 * Open a screen controller
	 * @param {Object} _params The arguments for the method
	 * @param {String} _params.ctrl name of the Controller to be opened
	 * @param {String} _params.title title to be displayed on the title bar
	 * @param {String} _params.titleid localized title to be displayed on the title bar, ignored if title is set
	 * @param {String} _params.navBarHidden hides navigation bar when true
	 * @param {String} _params.gestureEnabled disables gesture when false
	 * @param {Object} _params.ctrlArguments arguments to be passed to the new controller
	 * @return {Controller} Returns the new controller
	 */
	this.open = function(_params) {

		if (that.isBusy) {
			return;
		}

		if (_params.stack && that.navigationWindow) {
			return that.push(_params);
		}

		that.isBusy = true;

		that.controllers = [];

		that.currentController = Alloy.createController("hamburger/window", _params);

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
	 * @param {Object} _params The arguments for the method
	 * @param {String} _params.ctrl name of the Controller to be opened
	 * @param {String} _params.title title to be displayed on the title bar
	 * @param {String} _params.titleid localized title to be displayed on the title bar, ignored if title is set
	 * @param {String} _params.navBarHidden hides navigation bar when true
	 * @param {String} _params.gestureEnabled disables gesture when false
	 * @param {Object} _params.ctrlArguments arguments to be passed to the new controller
	 * @param {Object} _params.stack should be true always
	 * @return {Controller} Returns the new controller
	 */
	this.push = function(_params) {

		if (that.isBusy) {
			return;
		}

		that.isBusy = true;

		var controller = Alloy.createController("hamburger/window", _params);

		that.navigationWindow.openWindow(controller.getView());

		that.currentController.getView().fireEvent("blur");

		that.controllers.push(controller);

		that.currentController = controller;

		that.isBusy = false;

		return that.currentController;
	};

	/**
	 * closes a controller
	 * @param {Number} _count No. of pages to close (optional)
	 * @return {Controller} Returns the current controller
	 */
	this.close = function(_count) {

		if (that.isBusy || that.controllers.length == 1) {
			return;
		}

		that.isBusy = true;

		var len = that.controllers.length,
		    count = (_count || 1) >= len ? len - 1 : (_count || 1),
		    removeControllers = that.controllers.splice(len - count, count);

		for (var i = 0,

		    x = removeControllers.length - 1; i < x; i++) {

			removeControllers[i].getView().close();
		}

		that.navigationWindow.closeWindow(that.currentController.getView());

		that.currentController = that.controllers[that.controllers.length - 1];

		that.currentController.getView().fireEvent("focus");

		//that.testOutput();

		that.isBusy = false;

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
	 * @param {String} _message
	 */
	this.showLoader = function(_message) {

		if (that.loader == null) {

			that.loader = Alloy.createWidget("ti.loading", "widget", {
				message : _message || Alloy.Globals.strings.msgPleaseWait
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

		var logger = require("logger"),
		    stack = [];

		for (var i = 0,

		    x = that.controllers.length; i < x; i++) {

			stack.push(that.controllers[i].getView());
		}

		logger.info(JSON.stringify(stack));

		logger.info("stack length: " + that.controllers.length);
	};
}

// Calling this module function returns a new navigation instance
module.exports = function(_args) {
	return new Navigation(_args);
};
