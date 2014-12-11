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
	 * @type {Controllers}
	 */
	this.currentController = null;

	/**
	 * The first controller's arguments, used in android to redirect user back to the controller on back button
	 * @type {Boolean/Object}
	 */
	this.homeParams = false;

	/**
	 * The current top level controller's arguments
	 * @type {Object}
	 */
	this.currentParams = null;

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
	 * The window object
	 * @type {Object}
	 */
	this.window = _args.window;

	/**
	 * The hamburger object
	 * @type {Object}
	 */
	this.hamburger = _args.hamburger;

	/**
	 * ti.keyboard module
	 * @type {Module}
	 */
	this.keyboard = OS_IOS || OS_ANDROID ? require("ti.keyboard") : false;

	/**
	 * Open a screen controller
	 * @param {Object} _params The arguments for the method
	 * @param {String} _params.ctrl name of the Controller to be opened
	 * @param {Object} _params.ctrlArguments arguments to be passed to the new controller
	 * @param {String} _params.titleImage image to be displayed on the title bar
	 * @param {String} _params.title title to be displayed on the title bar
	 * @param {String} _params.titleid localized title to be displayed on the title bar, ignored if title is set
	 * @param {Boolen} _params.stack if true opens the Controller as a detail page
	 * @param {Function} _callback
	 * @return {Controller} Returns the new controller
	 */
	this.open = function(_params, _callback) {

		if (that.isBusy) {
			return;
		}

		that.isBusy = true;

		that.hideKeyboard();

		/**
		 *  if _params.stack is true (or) that.controllers.length > 1 (if a detail view is already opened on stack)
		 */
		if (!_.has(_params, "stack")) {
			_params.stack = that.controllers.length > 1;
		}

		if (_params.stack) {
			that.isBusy = false;
			return that.push(_params, _callback);
		}

		if (!that.homeParams) {
			that.homeParams = _params;
		}

		that.currentParams = _params;

		var controller = Alloy.createController("hamburger/template", that.currentParams);

		var view = controller.getView();

		that.init(controller);

		view.addEventListener("postlayout", function postlayout() {

			view.removeEventListener("postlayout", postlayout);

			// Handle removing the current controller from the screen
			if (that.currentController) {
				that.terminate();
				that.window.remove(that.currentController.getView());
				that.controllers.pop();
			}

			that.controllers.push(controller);
			that.currentController = controller;

			//that.testOutput();

			that.isBusy = false;

			if (_callback) {
				_callback();
			}
		});

		that.window.add(view);

		return controller;
	};

	/**
	 * Pushes a screen controller on top of the stack
	 * @param {Object} _params The arguments for the method
	 * @param {Function} _callback
	 * @return {Controller} Returns the new controller
	 */
	this.push = function(_params, _callback) {

		if (that.isBusy) {
			return;
		}

		that.isBusy = true;

		that.hideKeyboard();

		var controller = Alloy.createController("hamburger/template", _params);

		that.init(controller);

		var view = controller.getView();

		view.addEventListener("postlayout", function postlayout() {

			view.removeEventListener("postlayout", postlayout);

			that.animateIn(view, function() {

				that.currentController.getView().visible = false;

				that.controllers.push(controller);
				that.currentController = controller;

				if (_callback) {
					_callback();
				}
			});

			//that.testOutput();
		});

		that.window.add(view);

		return controller;
	};

	/**
	 * Close the controller at the top of the stack
	 * @param {Number} _count - number of pages to be close, by default 1
	 * @param {Function} _callback
	 * @param {Boolean} _backButton
	 */
	this.close = function(_count, _callback, _backButton) {

		if (that.isBusy) {
			return;
		}

		that.isBusy = true;

		if (OS_ANDROID && _backButton === true) {
			if (that.loader != null) {
				that.isBusy = false;
				return;
			}
			if (_.isFunction(that.currentController.child.androidback) && that.currentController.child.androidback()) {
				that.isBusy = false;
				return;
			}
			if (that.hamburger.closeLeftMenu()) {
				that.isBusy = false;
				return;
			}
		}

		that.hideKeyboard();

		if (that.controllers.length == 1) {

			var condition = OS_ANDROID && _backButton === true;

			if (condition && that.homeParams.ctrl != that.currentParams.ctrl) {
				that.isBusy = false;
				return that.open(that.homeParams);
			}

			if (OS_IOS || OS_MOBILEWEB || condition) {
				that.terminate();
				that.controllers = [];
				that.currentController = null;
				that.window.close();
			}

			if (_callback) {
				_callback();
			}

		} else {

			var len = that.controllers.length;

			var count = _count || 1;

			if (count >= len) {
				count = len - 1;
			}

			that.terminate();

			var removeControllers = that.controllers.splice(len - count, count);
			for (var i = 0,
			    x = removeControllers.length - 1; i < x; i++) {
				that.terminate(removeControllers[i]);
				that.window.remove(removeControllers[i].getView());
			}

			var controllerToOpen = that.controllers[that.controllers.length - 1];
			controllerToOpen.getView().visible = true;

			that.animateOut(that.currentController.getView(), function() {

				that.currentController = controllerToOpen;

				//that.testOutput();

				if (_callback) {
					_callback();
				}

			});
		}
	};

	/**
	 * Close all controllers except the first in the stack
	 * @param {Function} _callback
	 */
	this.closeToHome = function(_callback) {

		if (that.isBusy) {
			return;
		}

		if (that.controllers.length == 1) {
			if (_callback) {
				_callback();
			}
			return;
		}

		that.close(that.controllers.length - 1, function() {
			if (_callback) {
				_callback();
			}
		});
	};

	/**
	 * shows navBar of current controller
	 * @param {Function} _callback
	 */
	this.showNavBar = function(_animated, _callback) {

		if (that.isBusy) {
			return;
		}

		that.isBusy = true;

		that.currentController.showNavBar(_animated, function() {

			that.isBusy = false;

			if (_callback) {
				_callback();
			}

		});
	};

	/**
	 * Hides navBar of current controller
	 * @param {Function} _callback
	 */
	this.hideNavBar = function(_animated, _callback) {

		if (that.isBusy) {
			return;
		}

		that.isBusy = true;

		that.currentController.hideNavBar(_animated, function() {

			that.isBusy = false;

			if (_callback) {
				_callback();
			}

		});
	};

	/**
	 * Calls init method of the current controller if exists
	 * @param {Controller} _controller
	 */
	this.init = function(_controller) {
		var controller = _controller || that.currentController;
		if (_.isFunction(controller.child.init)) {
			controller.child.init();
		}
	};

	/**
	 * Calls terminate method of the controller if exists
	 * @param {Controller} _controller
	 */
	this.terminate = function(_controller) {
		var controller = _controller || that.currentController;
		if (_.isFunction(controller.child.terminate)) {
			controller.child.terminate();
		}
	};

	/**
	 * Animate in a screen controller
	 * @param {View} _view
	 * @param {Function} _callback
	 */
	this.animateIn = function(_view, _callback) {

		var animation = Ti.UI.createAnimation({
			opacity : 1,
			left : 0,
			duration : Alloy.CFG.ANIMATION_DURATION
		});

		animation.addEventListener("complete", function onComplete() {

			_view.applyProperties({
				opacity : 1,
				left : 0
			});

			animation.removeEventListener("complete", onComplete);

			that.isBusy = false;

			if (_callback) {
				_callback();
			}

		});

		_view.animate(animation);
	};

	/**
	 * Animate out a screen controller
	 * @param {View} _controller
	 * @param {Function} _callback
	 */
	this.animateOut = function(_view, _callback) {

		var animation = Ti.UI.createAnimation({
			opacity : 0,
			left : that.device.width,
			duration : Alloy.CFG.ANIMATION_DURATION
		});

		animation.addEventListener("complete", function onComplete() {

			that.window.remove(_view);

			animation.removeEventListener("complete", onComplete);

			that.isBusy = false;

			if (_callback) {
				_callback();
			}

		});

		_view.animate(animation);
	};

	/**
	 * Animate fade out a screen controller
	 * @param {View} _controller
	 * @param {Function} _callback
	 */
	this.fadeOut = function(_view, _callback) {

		var animation = Ti.UI.createAnimation({
			opacity : 0,
			duration : Alloy.CFG.ANIMATION_DURATION
		});

		animation.addEventListener("complete", function onComplete() {

			that.window.remove(_view);

			animation.removeEventListener("complete", onComplete);

			that.isBusy = false;

			if (_callback) {
				_callback();
			}

		});

		_view.animate(animation);
	};

	/**
	 *hides the keyboard
	 */
	this.hideKeyboard = function() {
		if (that.keyboard) {
			that.keyboard.hide();
		}
	};

	/**
	 *block ui
	 * @param {Object} _params
	 */
	this.showLoader = function(_params) {
		if (that.loader == null) {
			that.hideKeyboard();
			that.loader = Alloy.createWidget("com.mscripts.loading", "widget", _params);
			that.window.add(that.loader.getView());
		}
	};

	/**
	 *un-block ui
	 */
	this.hideLoader = function() {
		if (that.loader != null) {
			that.window.remove(that.loader.getView());
			that.loader = null;
		}
	};

	/**
	 *un-block ui
	 */
	this.setMessage = function(message) {
		if (that.loader != null) {
			that.loader.setMessage(message);
		}
	};

	/**
	 * Spits information about the navigation stack out to console
	 */
	this.testOutput = function() {

		var stack = [];

		for (var i = 0,
		    x = that.controllers.length; i < x; i++) {
			stack.push(that.controllers[i].getView());
		}

		console.log(JSON.stringify(stack));
		console.log("Stack Length: " + that.controllers.length);
	};
}

// Calling this module function returns a new navigation instance
module.exports = function(_args) {
	return new Navigation(_args);
};
