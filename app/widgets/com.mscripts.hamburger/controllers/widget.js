var args = arguments[0] || {},
    LEFT_MENU_WIDTH = 240,
    MENU_SLIDING_DURATION = 100,
    _menuOpen = false,
    _busy = false;

function orientationChanged(e) {
	var newWidth;
	newWidth = Ti.Platform.displayCaps.platformWidth;
	if (OS_ANDROID)
		newWidth /= Ti.Platform.displayCaps.logicalDensityFactor;
	$.mainView.width = newWidth;
}

exports.init = function(params) {
	if (_.has(params, "menuView")) {
		$.setMenuView(params.menuView);
	}
	//calling orientationChanged to apply width to mainView - Do not remove
	orientationChanged();
	//Ti.Gesture.addEventListener("orientationchange", orientationChanged);
};

exports.terminate = function(params) {
	//Ti.Gesture.removeEventListener("orientationchange", orientationChanged);
};

exports.toggleLeftMenu = function(callback) {
	if (!_busy) {
		_busy = true;
		var moveTo = 0;
		if (!_menuOpen) {
			moveTo = LEFT_MENU_WIDTH;
		}
		_menuOpen = !_menuOpen;
		var animation = Ti.UI.createAnimation({
			left : moveTo,
			curve : Ti.UI.ANIMATION_CURVE_EASE_OUT,
			duration : MENU_SLIDING_DURATION
		});
		animation.addEventListener("complete", function onComplete() {
			animation.removeEventListener("complete", onComplete);
			_busy = false;
			if (callback) {
				callback();
			}
		});
		$.mainView.animate(animation);
	}
};

exports.openLeftMenu = function(callback) {
	if (!_menuOpen) {
		$.toggleLeftMenu(callback);
		return true;
	} else {
		if (callback) {
			callback();
		}
		return false;
	}
};

exports.closeLeftMenu = function(callback) {
	if (_menuOpen) {
		$.toggleLeftMenu(callback);
		return true;
	} else {
		if (callback) {
			callback();
		}
		return false;
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
