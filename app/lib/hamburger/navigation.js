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
	 * The current top level controller's name 
	 * @type {Controllers}
	 */
	this.currentItem = null;

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

		that.isBusy = true;

		that.currentItem = arguments;

		var controller = Alloy.createController("hamburger/template", that.currentItem);

		that.init(controller);

		var view = controller.getView();

		var postlayout = function() {

			view.removeEventListener("postlayout", postlayout);

			// Handle removing the current controller from the screen
			if (that.currentController) {
				that.terminate(that.currentController);
				that.parent.remove(that.currentController.getView());
				that.controllers.pop();
			}

			that.controllers.push(controller);
			that.currentController = controller;

			//that.testOutput();
		};

		view.addEventListener("postlayout", postlayout);

		that.parent.add(view);

		that.isBusy = false;

		return that.currentController;
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

		that.init(controller);

		var view = controller.getView();

		var postlayout = function() {

			view.removeEventListener("postlayout", postlayout);

			that.controllers.push(controller);

			that.currentController = controller;

			that.animateIn(view);

			//that.testOutput();
		};

		view.addEventListener("postlayout", postlayout);

		that.parent.add(view);

		return that.currentController;
	};

	/**
	 * Close the controller at the top of the stack
	 * @param {Function} _callback
	 */
	this.close = function(_callback) {

		if (that.isBusy) {
			return;
		}

		that.isBusy = true;

		if (that.controllers.length == 1) {
			if (OS_ANDROID) {
				that.terminate(that.currentController);
				that.window.close();
				if (_callback) {
					_callback();
				}
				that.isBusy = false;
			}
			return;
		}
		
		that.terminate(that.currentController);

		that.animateOut(that.currentController.getView(), function() {

			that.controllers.pop();

			// Assign the new current controller from the stack
			that.currentController = that.controllers[that.controllers.length - 1];

			//that.testOutput();

			if (_callback) {
				_callback();
			}

		});
	};

	/**
	 * Close all controllers except the first in the stack
	 * @param {Function} _callback
	 */
	this.closeToHome = function(_callback) {

		if (that.isBusy || that.controllers.length == 1) {
			return;
		}

		that.isBusy = true;

		var removeControllers = that.controllers.splice(1, that.controllers.length - 2);

		that.currentController = that.controllers[that.controllers.length - 1];

		that.terminate(that.currentController);

		for (var i = 0, x = removeControllers.length; i < x; i++) {
			that.terminate(removeControllers[i]);
			that.parent.remove(removeControllers[i].getView());
		}

		that.animateOut(that.currentController.getView(), function() {

			that.controllers.pop();

			// Assign the new current controller from the stack
			that.currentController = that.controllers[that.controllers.length - 1];

			//that.testOutput();

			if (_callback) {
				_callback();
			}

		});
	};

	/**
	 * Calls init method of the controller if exists
	 * @param {Controller} _controller
	 */
	this.init = function(_controller) {
		if (_.isFunction(_controller.child.init)) {
			_controller.child.init();
		}
	};

	/**
	 * Calls terminate method of the controller if exists
	 * @param {Controller} _controller
	 */
	this.terminate = function(_controller) {
		if (_.isFunction(_controller.child.terminate)) {
			_controller.child.terminate();
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
	 * Spits information about the navigation stack out to console
	 */
	this.testOutput = function() {
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
