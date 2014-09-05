var args = arguments[0] || {};
var LEFT_MENU_WIDTH = 240, MENU_SLIDING_DURATION = 150;
var _parent, _ctrls = [], _stackIndex = -1, _busy = false, _menuOpen = false;

function enableSwipe() {
	_parent.addEventListener("swipe", didSwipe);
}

function disableSwipe() {
	_parent.removeEventListener("swipe", didSwipe);
}

function didSwipe(e) {
	if ((_menuOpen == false && e.direction == "right") || (_menuOpen == true && e.direction == "left")) {
		$.toggleLeftMenu();
	}
}

function orientationChanged(e) {
	var newWidth;
	newWidth = Ti.Platform.displayCaps.platformWidth;
	if (OS_ANDROID)
		newWidth /= Ti.Platform.displayCaps.logicalDensityFactor;
	$.mainView.width = newWidth;
}

exports.init = function(params) {
	if (_.has(params, "parent")) {
		_parent = params.parent;
		enableSwipe();
	}
	if (_.has(params, "ctrls")) {
		_ctrls = params.ctrls;
	}
	if (_.has(params, "menuView")) {
		$.setMenuView(params.menuView);
	}
	//calling orientationChanged to apply width to mainView - Do not remove
	orientationChanged();
	//Ti.Gesture.addEventListener("orientationchange", orientationChanged);
	Alloy.Globals.Navigator = $;
};

exports.destroy = function(params) {
	if (_parent) {
		disableSwipe();
	}
	//Ti.Gesture.removeEventListener("orientationchange", orientationChanged);
	delete Alloy.Globals.Navigator;
};

exports.toggleLeftMenu = function() {
	if (!_busy) {
		_busy = true;
		var moveTo = 0;
		if (!_menuOpen) {
			moveTo = LEFT_MENU_WIDTH;
		}
		_menuOpen = !_menuOpen;
		$.mainView.animate(Ti.UI.createAnimation({
			left : moveTo,
			curve : Ti.UI.ANIMATION_CURVE_EASE_OUT,
			duration : MENU_SLIDING_DURATION
		}), function() {
			_busy = false;
		});
	}
};

exports.openView = function(ctrlParams) {
	if (!_busy) {
		var stackIndex = _.indexOf(_ctrls, ctrlParams.ctrl);
		if (stackIndex < 0) {
			return false;
		}
		if (_stackIndex == stackIndex && _menuOpen) {
			$.toggleLeftMenu();
			return false;
		}
		_busy = true;
		var len = $.mainView.children.length;
		if (stackIndex >= len) {
			for (var i = len; i <= stackIndex; i++) {
				var view = Ti.UI.createView({
					backgroundColor : "#fff",
					zIndex : i
				});
				$.mainView.add(view);
				console.debug("stack level " + i + " is added");
			}
		}
		var viewStack = $.mainView.children;
		if (viewStack[stackIndex].children.length == 0) {
			var template = Widget.createController("template", ctrlParams).getView();
			template.children[1].children[0].fireEvent("push");
			viewStack[stackIndex].add(template);
			console.debug(ctrlParams.ctrl + " is created");
		}
		var tempIndex;
		for (var i in viewStack) {
			if (stackIndex != i) {
				if (_stackIndex != i) {
					viewStack[i].zIndex = i;
				} else {
					tempIndex = i;
				}
			}
		}
		if (_stackIndex >= 0) {
			console.debug("current view at " + _stackIndex + " will be moved to " + tempIndex);
			viewStack[_stackIndex].children[0].children[1].children[0].fireEvent("pop");
			viewStack[_stackIndex].zIndex = tempIndex;
			console.debug("current view at " + _stackIndex + " has been moved to " + viewStack[_stackIndex].zIndex);
		}
		console.debug("view at " + stackIndex + " will be moved to 100");
		viewStack[stackIndex].zIndex = 100;
		console.debug("view at " + stackIndex + " has been moved to " + viewStack[stackIndex].zIndex);
		_stackIndex = stackIndex;
		_busy = false;
		if (_menuOpen) {
			$.toggleLeftMenu();
		}
	}
};

exports.pushView = function(ctrlParams) {
	if (!_busy) {
		_busy = true;
		var viewStack = $.mainView.children;
		var viewsOnStack = viewStack[_stackIndex].children;
		var viewToPop = viewsOnStack[viewsOnStack.length - 1];
		var viewToPush = Widget.createController("template", ctrlParams).getView();
		viewToPush.applyProperties({
			left : $.mainView.width - 1
		});
		var doAnimations = function() {
			console.debug("open window stack : do animations (postlayout called)");
			viewToPush.removeEventListener("postlayout", doAnimations);
			viewToPush.children[1].children[0].fireEvent("push");
			viewToPop.animate(Ti.UI.createAnimation({
				left : -45,
				curve : Ti.UI.ANIMATION_CURVE_EASE_OUT,
				duration : 400
			}), function() {
				viewToPop.applyProperties({
					left : -45
				});
			});
			viewToPush.animate(Ti.UI.createAnimation({
				left : 0,
				curve : Ti.UI.ANIMATION_CURVE_EASE_OUT,
				duration : 450
			}), function() {
				viewToPush.applyProperties({
					left : 0
				});
				_busy = false;
			});
		};
		viewToPush.addEventListener("postlayout", doAnimations);
		viewStack[_stackIndex].add(viewToPush);
	}
};

exports.popView = function() {
	if (!_busy) {
		_busy = true;
		var viewStack = $.mainView.children;
		var viewsOnStack = viewStack[_stackIndex].children;
		var viewToPop = viewsOnStack[viewsOnStack.length - 1];
		var viewToPush = viewsOnStack[viewsOnStack.length - 2];
		viewToPop.children[1].children[0].fireEvent("pop");
		viewToPop.animate(Ti.UI.createAnimation({
			left : $.mainView.width - 1,
			curve : Ti.UI.ANIMATION_CURVE_EASE_OUT,
			duration : 400
		}), function() {
			viewStack[_stackIndex].remove(viewToPop);
			viewToPop = null;
		});
		viewToPush.animate(Ti.UI.createAnimation({
			left : 0,
			curve : Ti.UI.ANIMATION_CURVE_EASE_OUT,
			duration : 450
		}), function() {
			viewToPush.applyProperties({
				left : 0
			});
			_busy = false;
		});
	}
};

exports.setMenuView = function(view) {
	$.menuView.add(view);
	var children = $.menuView.children;
	if (children.length > 1) {
		$.menuView.remove(children[1]);
	}
};

exports.setDuration = function(duration) {
	MENU_SLIDING_DURATION = duration;
};

exports.setMenuWidth = function(width) {
	LEFT_MENU_WIDTH = width;
	$.menuView.setWidth(LEFT_MENU_WIDTH);
};
