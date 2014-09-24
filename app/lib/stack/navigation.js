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
	 * Open a screen controller
	 * @param {Object} _params The arguments for the method
	 * @param {String} _params.ctrl name of the Controller to be opened
	 * @param {Object} _params.ctrlArguments arguments to be passed to the new controller
	 * @param {String} _params.titleImage image to be displayed on the title bar
	 * @param {String} _params.title title to be displayed on the title bar
	 * @param {String} _params.titleid localized title to be displayed on the title bar, ignored if title is set
	 * @param {Boolen} _params.stack if true opens the Controller as a detail page
	 * @return {Controller} Returns the new controller
	 */
	this.open = function(_params) {

		/**
		 *  if _params.stack is true (or) that.controllers.length > 1 (if a detail view is already opened on stack)
		 */
		if (_params.stack || that.controllers.length > 1) {
			return that.push(_params);
		}

		if (that.isBusy) {
			return;
		}

		that.isBusy = true;

		var controller = Alloy.createController("stack/template", _params);

		var view = controller.getView();

		that.init(controller);

		var postlayout = function() {

			view.removeEventListener("postlayout", postlayout);

			// Handle removing the current controller from the screen
			if (that.currentController) {
				that.terminate();
				that.window.remove(that.currentController.getView());
				that.controllers.pop();
			}

			that.controllers.push(controller);
			that.currentController = controller;

			that.isBusy = false;
		};

		view.addEventListener("postlayout", postlayout);

		that.window.add(view);

		return controller;
	};

	/**
	 * Pushes a screen controller on top of the stack
	 * @param {Object} _params The arguments for the method
	 * @return {Controller} Returns the new controller
	 */
	this.push = function(_params) {

		if (that.isBusy) {
			return;
		}

		that.isBusy = true;

		var controller = Alloy.createController("stack/template", _params);

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

		if (that.isBusy || (OS_ANDROID && _backButton === true && that.loader != null)) {
			return;
		}

		that.isBusy = true;

		that.terminate();

		if (that.controllers.length == 1) {

			that.controllers = [];
			that.currentController = null;

			if (OS_IOS || OS_MOBILEWEB || (OS_ANDROID && _backButton === true)) {
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

			var removeControllers = that.controllers.splice(len - count, count - 1);
			for (var i = 0, x = removeControllers.length; i < x; i++) {
				that.terminate(removeControllers[i]);
				that.window.remove(removeControllers[i].getView());
			}

			that.animateOut(that.currentController.getView(), function() {

				that.controllers.pop();

				that.currentController = that.controllers[that.controllers.length - 1];

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

		if (that.isBusy || that.controllers.length == 1) {
			return;
		}

		that.close(that.controllers.length - 1, function() {
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

		var stack = [];

		for (var i = 0, x = that.controllers.length; i < x; i++) {
			stack.push(that.controllers[i].getView());
		}

		console.debug("Stack Length: " + that.controllers.length);
		console.debug(JSON.stringify(stack));
	};
}

// Calling this module function returns a new navigation instance
module.exports = function(_args) {
	return new Navigation(_args);
};
