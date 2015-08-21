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

		var controller = Alloy.createController("drawer/view", params);

		that.drawer.setCenterWindow(controller.getView());

		controller.focus();

		var len = that.controllers.length;
		if (len) {

			if (len > 1) {
				/**
				 * remove all controllers from stack
				 */
				var count = len - 1,
				    removeControllers = that.controllers.splice(len - count, count);
				for (var i = 0,
				    x = removeControllers.length - 1; i < x; i++) {
					/**
					 * close one by one from last controller - 2 to first / master controller
					 */
					removeControllers[i].getView().close();
				}
				/**
				 * close the last / visible controller
				 * so it will not directly show the first controller
				 */
				that.currentController.getView().close({
					activityEnterAnimation : Ti.App.Android.R.anim.acitivty_open_back,
					activityExitAnimation : Ti.App.Android.R.anim.acitivty_close_back,
					animated : true
				});
				/**
				 * store first / master controller reference
				 * that.controllers.length - 1 should be 0 here
				 */
				that.currentController = that.controllers[that.controllers.length - 1];
			}

			/**
			 * terminate first / master controller controller
			 * Note: remember android/drawer/view.js will only have terminate method
			 */
			that.currentController.terminate();

			/**
			 *re-initate the stack
			 */
			that.controllers = [];
		}

		/**
		 * assign currentController only after closeToRoot
		 * that.currentController reference is used in
		 * that.close method
		 */
		that.currentController = controller;

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
			that.currentController.blur();
			that.controllers.push(controller);
			that.currentController = controller;
			that.isBusy = false;
		});

		window.open({
			activityEnterAnimation : Ti.App.Android.R.anim.acitivty_open,
			activityExitAnimation : Ti.App.Android.R.anim.acitivty_close,
			animated : true
		});

		return controller;
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

		if (androidback) {
			if (that.drawer.isLeftWindowOpen()) {
				that.drawer.closeLeftWindow();
				return;
			}
			if (that.currentController.backButtonHandler && that.currentController.backButtonHandler()) {
				return;
			}
			if (that.controllers.length == 1) {
				/**
				 * going back to landing page
				 * if current master page is not the one
				 */
				var landingPage = Alloy.Collections.menuItems.findWhere({
					landing_page : true
				});
				if (landingPage && that.currentController.ctrl != landingPage.get("ctrl")) {
					return that.open(landingPage.toJSON());
				} else {
					return that.terminate();
				}
			}
		}

		if (that.controllers.length == 1) {
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
			that.currentController.focus();
			that.isBusy = false;
		});

		window.close({
			activityEnterAnimation : Ti.App.Android.R.anim.acitivty_open_back,
			activityExitAnimation : Ti.App.Android.R.anim.acitivty_close_back,
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
			logger.debug(TAG, "stack index", i, that.controllers[i].__controllerPath);
		}

	};
}

// Calling this module function returns a new navigation instance
module.exports = function(args) {
	return new Navigation(args);
};
