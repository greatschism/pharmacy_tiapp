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
    ctrlShortCode = require("ctrlShortCode"),
    analyticsHandler = require("analyticsHandler");

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

		analyticsHandler.navEvent(that.currentController.ctrlShortCode || TAG, ctrlShortCode[params.ctrl]);

		if (params.stack) {
			return that.push(params);
		}

		that.isBusy = true;

		/**
		 * on android keyboard will not be hidden
		 * if it is opened, hide it
		 */
		if (Ti.App.keyboardVisible) {
			Ti.App.hideKeyboard();
		}

		that.currentController = Alloy.createController("drawer/view", params);

		that.currentController.init();

		that.drawer.setCenterWindow(that.currentController.getView());

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
				removeControllers.pop().getView().close({
					activityEnterAnimation : Ti.App.Android.R.anim.activity_open_back,
					activityExitAnimation : Ti.App.Android.R.anim.activity_close_back,
					animated : true
				});
			}

			//terminate top level controller
			that.controllers.pop().terminate();
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

		window.open({
			activityEnterAnimation : Ti.App.Android.R.anim.activity_open,
			activityExitAnimation : Ti.App.Android.R.anim.activity_close,
			animated : true
		});

		//that.testOutput();

		return that.currentController;
	};

	/**
	 * closes a controller
	 * @param {Number} count No. of pages to close (optional)
	 * @param {Boolean} androidback whether back button triggered this action
	 * @return {Controller} Returns the current controller
	 */
	this.close = function(count, androidback) {

		if (that.isBusy) {
			return;
		}

		var len = that.controllers.length;
		if (androidback) {
			//close drawer if opened
			if (that.drawer.isLeftWindowOpen()) {
				that.drawer.closeLeftWindow();
				return;
			}
			if (len == 1) {
				//back button handler for root window
				if (that.currentController.backButtonHandler && that.currentController.backButtonHandler()) {
					return;
				}
				/**
				 * going back to landing page
				 * if current top level controller is not the one
				 */
				var landingPage = Alloy.Collections.menuItems.findWhere({
					landing_page : true
				});
				if (landingPage && landingPage.get("ctrl") != that.currentController.ctrlPath) {
					return that.open(landingPage.toJSON());
				} else {
					return that.terminate();
				}
			}
		}

		if (len == 1) {
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

		var from = that.currentController.ctrlShortCode,
		    window = that.currentController.getView();

		that.currentController = that.controllers[that.controllers.length - 1];

		analyticsHandler.navEvent(from, that.currentController.ctrlShortCode);

		window.addEventListener("close", function didCloseWindow(e) {
			window.removeEventListener("close", didCloseWindow);
			that.currentController.focus();
			that.isBusy = false;
		});

		window.close({
			activityEnterAnimation : Ti.App.Android.R.anim.activity_open_back,
			activityExitAnimation : Ti.App.Android.R.anim.activity_close_back,
			animated : true
		});

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
