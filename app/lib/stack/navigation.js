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
	 * logger
	 * @type {Logger}
	 */
	this.logger = require("logger");

	/**
	 * name of the navigator
	 * @type {String}
	 */
	this.name = "stack";

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
	 * The current root controller's arguments
	 * @type {Object}
	 */
	this.currentRootParams = null;

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
	 * @param {Boolean} _animate
	 * @param {Object} _animDict
	 * @return {Controller} Returns the new controller
	 */
	this.open = function(_params, _callback, _animate, _animDict) {

		if (that.isBusy) {
			return;
		}

		if (_params.stack) {
			return that.push(_params, _callback, _animate, _animDict);
		} else if (that.controllers.length > 1) {
			return that.replace(_params, _callback, _animate, _animDict);
		}

		that.isBusy = true;

		that.hideKeyboard();

		that.currentRootParams = _params;

		var controller = Alloy.createController("stack/template", that.currentRootParams),
		    view = controller.getView();

		that.init(controller);

		if (_animate) {

			if (!_animDict) {
				_animDict = {
					initDict : {
						opacity : 0
					},
					terminateDict : {
						opacity : 1
					},
					animation : {
						opacity : 1,
						duration : Alloy.CFG.ANIMATION_DURATION
					}
				};
			}

			if (_animDict.initDict) {
				view.applyProperties(_animDict.initDict);
			}

		}

		view.addEventListener("postlayout", function postlayout() {

			//post layout event can take us to a endless loop. so remove it
			view.removeEventListener("postlayout", postlayout);

			var animCallback = function() {

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
			};

			if (_animate) {

				var animation = Ti.UI.createAnimation(_animDict.animation);

				animation.addEventListener("complete", function onComplete() {

					animation.removeEventListener("complete", onComplete);

					view.applyProperties(_animDict.terminateDict || _animDict.animation);

					animCallback();
				});

				view.animate(animation);

			} else {

				animCallback();

			}

		});

		that.window.add(view);

		return controller;
	};

	/**
	 * Pushes a screen controller on top of the stack
	 * @param {Object} _params The arguments for the method
	 * @param {Function} _callback
	 * @param {Boolean} _animate
	 * @param {Object} _animDict
	 * @return {Controller} Returns the new controller
	 */
	this.push = function(_params, _callback, _animate, _animDict) {

		if (that.isBusy) {
			return;
		}

		that.isBusy = true;

		that.hideKeyboard();

		var controller = Alloy.createController("stack/template", _params),
		    view = controller.getView();

		that.init(controller);

		if (_animate !== false) {

			if (!_animDict) {
				_animDict = {
					initDict : {
						opacity : 0,
						left : that.device.width
					},
					terminateDict : {
						opacity : 1,
						left : 0
					},
					animation : {
						opacity : 1,
						left : 0,
						duration : Alloy.CFG.ANIMATION_DURATION
					}
				};
			}

			if (_animDict.initDict) {
				view.applyProperties(_animDict.initDict);
			}

		}

		view.addEventListener("postlayout", function postlayout() {

			//post layout event can take us to a endless loop. so remove it
			view.removeEventListener("postlayout", postlayout);

			var animCallback = function() {

				that.currentController.getView().visible = false;

				that.controllers.push(controller);

				that.currentController = controller;

				//that.testOutput();

				that.isBusy = false;

				if (_callback) {
					_callback();
				}
			};

			if (_animate !== false) {

				var animation = Ti.UI.createAnimation(_animDict.animation);

				animation.addEventListener("complete", function onComplete() {

					animation.removeEventListener("complete", onComplete);

					view.applyProperties(_animDict.terminateDict || _animDict.animation);

					animCallback();
				});

				view.animate(animation);

			} else {

				animCallback();

			}

		});

		that.window.add(view);

		return controller;
	};

	/**
	 * Replaces the entire stack
	 * @param {Object} _params The arguments for the method
	 * @param {Function} _callback
	 * @param {Boolean} _animate
	 * @param {Object} _animDict
	 * @return {Controller} Returns the new controller
	 */
	this.replace = function(_params, _callback, _animate, _animDict) {

		if (that.isBusy) {
			return;
		}

		that.isBusy = true;

		that.hideKeyboard();

		that.currentRootParams = _params;

		var controller = Alloy.createController("stack/template", that.currentRootParams),
		    view = controller.getView();

		that.init(controller);

		view.addEventListener("postlayout", function postlayout() {

			//post layout event can take us to a endless loop. so remove it
			view.removeEventListener("postlayout", postlayout);

			// add as the first element
			that.controllers.unshift(controller);

			that.isBusy = false;

			//close all on stack in background
			that.closeToRoot(function() {

				//that.testOutput();

				if (_callback) {
					_callback();
				}

			}, _animate, _animDict);

		});

		that.window.add(view);

		return controller;
	};

	/**
	 * Close the controller at the top of the stack
	 * @param {Number} _count - number of pages to be close, by default 1
	 * @param {Function} _callback
	 * @param {Boolean} _animate
	 * @param {Object} _animDict
	 * @param {Boolean} _backButton
	 */
	this.close = function(_count, _callback, _animate, _animDict, _backButton) {

		if (that.isBusy) {
			return;
		}

		that.isBusy = true;

		if (OS_ANDROID && _backButton === true) {

			if (that.loader != null) {

				that.isBusy = false;

				return;
			}

			if (_.isFunction(that.currentController.child.backButtonHandler)) {

				that.isBusy = false;

				that.currentController.child.backButtonHandler(true);

				return;
			}

			if (_.isFunction(that.currentController.child.androidback) && that.currentController.child.androidback()) {

				that.isBusy = false;

				return;
			}

		}

		that.hideKeyboard();

		if (that.controllers.length == 1) {

			if (OS_IOS || OS_MOBILEWEB || (OS_ANDROID && _backButton === true)) {

				that.terminate();

				that.controllers = [];

				that.currentController = null;

				that.window.close();
			}

			if (_callback) {
				_callback();
			}

		} else {

			var len = that.controllers.length,
			    count = (_count || 1) >= len ? len - 1 : (_count || 1);

			that.terminate();

			var removeControllers = that.controllers.splice(len - count, count);

			for (var i = 0,

			    x = removeControllers.length - 1; i < x; i++) {

				that.terminate(removeControllers[i]);

				that.window.remove(removeControllers[i].getView());
			}

			var controllerToOpen = that.controllers[that.controllers.length - 1];

			controllerToOpen.getView().visible = true;

			var animCallback = function() {

				that.window.remove(that.currentController.getView());

				that.currentController = controllerToOpen;

				//that.testOutput();

				that.isBusy = false;

				if (_callback) {
					_callback();
				}
			};

			if (_animate !== false) {

				if (!_animDict) {
					_animDict = {
						initDict : {
							opacity : 1,
							left : 0
						},
						animation : {
							opacity : 0,
							left : that.device.width,
							duration : Alloy.CFG.ANIMATION_DURATION
						}
					};
				}

				if (_animDict.initDict) {
					that.currentController.getView().applyProperties(_animDict.initDict);
				}

				var animation = Ti.UI.createAnimation(_animDict.animation);

				animation.addEventListener("complete", function onComplete() {

					animation.removeEventListener("complete", onComplete);

					animCallback();
				});

				that.currentController.getView().animate(animation);

			} else {

				animCallback();

			}
		}
	};

	/**
	 * Close all controllers in the stack
	 * @param {Function} _callback
	 * @param {Boolean} _animate
	 * @param {Object} _animDict
	 */
	this.closeAll = function(_callback, _animate, _animDict) {
		that.closeToRoot(function() {
			that.close(1, function() {
				if (_callback) {
					_callback();
				}
			}, _animate || false, _animDict);
		}, _animate || false, _animDict);
	};

	/**
	 * Close all controllers except the first in the stack
	 * @param {Function} _callback
	 * @param {Boolean} _animate
	 * @param {Object} _animDict
	 */
	this.closeToRoot = function(_callback, _animate, _animDict) {

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

		}, _animate, _animDict);
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
	 * set loader message
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

		that.logger.d(JSON.stringify(stack));

		that.logger.d("Stack Length: " + that.controllers.length);
	};
}

// Calling this module function returns a new navigation instance
module.exports = function(_args) {
	return new Navigation(_args);
};
