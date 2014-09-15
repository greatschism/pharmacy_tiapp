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
 * @param {Object} _args.parent The parent which this navigation stack will belong
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
	 * The controller object that initiated the navigator
	 * @type {Controllers}
	 */
	this.starter = null;

	/**
	 * The current top level controller arguments reference
	 * @type {Object}
	 */
	this.currentItem = null;

	/**
	 * controller that blocks ui from user interaction
	 * @type {Controllers}
	 */
	this.loader = null;

	/**
	 * The parent object all screen controllers are added to
	 * @type {Object}
	 */
	this.parent = _args.parent;

	/**
	 * The window object
	 * @type {Object}
	 */
	this.window = _args.window;

	/**
	 * The device object
	 * @type {Object}
	 */
	this.device = _args.device;

	/**
	 * Open a screen controller
	 * @param {Object} arguments The arguments for the controller (required)
	 * @return {Controllers} Returns the new controller
	 */
	this.open = function(arguments) {

		/**
		 *  if arguments.stack is true (or) that.controllers.length > 1 (if a detail view is already opened on stack)
		 */
		if (arguments.stack || that.controllers.length > 1) {
			return that.push(arguments);
		}

		if (that.isBusy) {
			return;
		}

		that.currentItem = arguments;

		if (that.starter && that.starter.arguments.ctrl == that.currentItem.ctrl) {
			that.close();
			return that.starter;
		}

		that.isBusy = true;

		var controller = Alloy.createController("hamburger/template", that.currentItem);

		that.init(controller);

		that.parent.add(controller.getView());

		if (that.starter == null) {

			that.starter = controller;

			that.starter.arguments = that.currentItem;

		} else {

			// Handle removing the current controller from the screen
			if (that.currentController) {
				that.terminate();
				that.parent.remove(that.currentController.getView());
				that.controllers.pop();
			}

			that.controllers.push(controller);
			that.currentController = controller;
		}

		that.isBusy = false;

		return controller;
	};

	/**
	 * Pushes a screen controller on top of the stack
	 * @param {Object} arguments The arguments for the controller (required)
	 * @return {Controllers} Returns the new controller
	 */
	this.push = function(arguments) {

		if (that.isBusy) {
			return;
		}

		that.isBusy = true;

		var controller = Alloy.createController("hamburger/template", arguments);

		var view = controller.getView();

		var postlayout = function() {

			view.removeEventListener("postlayout", postlayout);

			that.controllers.push(controller);

			that.currentController = controller;

			that.animateIn(view, that.init);

			//that.testOutput();
		};

		view.addEventListener("postlayout", postlayout);

		that.parent.add(view);

		return controller;
	};

	/**
	 * Close the controller at the top of the stack
	 * @param {Function} _callback
	 */
	this.close = function(_callback) {

		if (that.isBusy) {
			return;
		}

		if (that.controllers.length == 0 && OS_ANDROID) {

			that.terminate(that.starter);

			that.window.close();

			if (_callback) {
				_callback();
			}

			return;

		} else if (that.controllers.length > 0) {

			that.isBusy = true;

			that.terminate();

			var animator = that.controllers.length == 1 ? "fadeOut" : "animateOut";

			that[animator](that.currentController.getView(), function() {

				that.controllers.pop();

				// Assign the new current controller from the stack
				that.currentController = that.controllers.length ? that.controllers[that.controllers.length - 1] : null;

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

		if (that.isBusy || that.controllers.length == 0) {
			return;
		}

		that.isBusy = true;

		var removeControllers = that.controllers.splice(0, that.controllers.length - 1);

		that.currentController = that.controllers[0];

		that.terminate();

		for (var i = 0, x = removeControllers.length; i < x; i++) {
			that.terminate(removeControllers[i]);
			that.parent.remove(removeControllers[i].getView());
		}

		that.fadeOut(that.currentController.getView(), function() {

			that.controllers.pop();

			that.currentController = null;

			if (_callback) {
				_callback();
			}

			//that.testOutput();

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
			duration : 300
		});

		animation.addEventListener("complete", function onComplete() {

			_view.applyProperties({
				opacity : 1,
				left : 0
			});

			that.isBusy = false;

			if (_callback) {
				_callback();
			}

			animation.removeEventListener("complete", onComplete);
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
			left : _args.device.width,
			duration : 300
		});

		animation.addEventListener("complete", function onComplete() {

			that.parent.remove(_view);

			that.isBusy = false;

			if (_callback) {
				_callback();
			}

			animation.removeEventListener("complete", onComplete);
		});

		_view.animate(animation);
	};

	/**
	 * Animate fade out a screen controller
	 * @param {View} _controller
	 * @param {Function} _callback
	 */
	this.fadeOut = function(_view, _callback) {
		require("alloy/animation").fadeAndRemove(_view, 300, that.parent, function() {
			that.isBusy = false;
			if (_callback) {
				_callback();
			}
		});
	};

	/**
	 *block ui
	 * @param {Object} _params
	 */
	this.showLoader = function(_params) {
		if (that.loader == null) {
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

		Ti.API.debug(JSON.stringify(that.starter));

		var stack = [];

		for (var i = 0, x = that.controllers.length; i < x; i++) {
			stack.push(that.controllers[i].getView());
		}

		Ti.API.debug("Stack Length: " + that.controllers.length);
		Ti.API.debug(JSON.stringify(stack));
	};
}

// Calling this module function returns a new navigation instance
module.exports = function(_args) {
	return new Navigation(_args);
};
