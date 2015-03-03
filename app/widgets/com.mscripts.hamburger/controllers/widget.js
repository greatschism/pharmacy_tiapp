var args = arguments[0] || {},
    LEFT_MENU_WIDTH = 240,
    MENU_SLIDING_DURATION = 100,
    keyboard = OS_IOS || OS_ANDROID ? require("ti.keyboard") : false,
    logicalDensityFactor = OS_ANDROID ? Ti.Platform.displayCaps.logicalDensityFactor : false,
    menuOpen = false,
    listenForDrag = false,
    touchStartX = 0,
    touchStarted = false,
    busy = false,
    parent;

function enableDrag() {
	if (!listenForDrag) {
		listenForDrag = true;
		$.dragView.addEventListener("touchstart", didTouchstart);
		$.dragView.addEventListener("touchmove", didTouchmove);
		$.dragView.addEventListener("touchend", didTouchend);
		$.overlayView.addEventListener("touchstart", didTouchstart);
		$.overlayView.addEventListener("touchmove", didTouchmove);
		$.overlayView.addEventListener("touchend", didTouchend);
	}
}

function disableDrag() {
	if (listenForDrag) {
		listenForDrag = false;
		$.dragView.removeEventListener("touchstart", didTouchstart);
		$.dragView.removeEventListener("touchmove", didTouchmove);
		$.dragView.removeEventListener("touchend", didTouchend);
		$.overlayView.removeEventListener("touchstart", didTouchstart);
		$.overlayView.removeEventListener("touchmove", didTouchmove);
		$.overlayView.removeEventListener("touchend", didTouchend);
	}
}

function didTouchstart(e) {
	touchStartX = parseInt(e.x, 10);
	touchStarted = true;
}

function didTouchmove(e) {
	var coords = e.source.convertPointToView({
		x : e.x,
		y : e.y
	}, parent),
	    _x = parseInt(coords.x, 10),
	    newLeft = _x - touchStartX,
	    children = parent.children;
	if (OS_ANDROID) {
		newLeft /= logicalDensityFactor;
	}
	if (touchStarted && newLeft >= 0 && newLeft <= LEFT_MENU_WIDTH) {
		children[children.length - 1].left = newLeft;
	}
	if (newLeft > 10) {
		touchStarted = true;
	}
}

function didTouchend(e) {
	touchStarted = false;
	var coords = e.source.convertPointToView({
		x : e.x,
		y : e.y
	}, parent),
	    _x = parseInt(coords.x, 10);
	if (OS_ANDROID) {
		_x /= logicalDensityFactor;
	}
	if (!menuOpen && _x >= LEFT_MENU_WIDTH / 2) {
		openLeftMenu();
	} else {
		menuOpen = true;
		closeLeftMenu();
	}
}

function init(_params) {
	if (!_.has(_params, "parent")) {
		return false;
	}
	parent = _params.parent;
	if (_.has(_params, "menuView")) {
		$.setMenuView(_params.menuView);
	}
	if (_params.disableDrag !== true) {
		enableDrag();
	}
}

function terminate() {
	parent = null;
}

function openLeftMenu(_callback) {
	if (!menuOpen) {
		toggleLeftMenu(_callback);
		return true;
	} else {
		if (_callback) {
			_callback();
		}
		return false;
	}
}

function closeLeftMenu(_callback) {
	if (menuOpen) {
		toggleLeftMenu(_callback);
		return true;
	} else {
		if (_callback && _callback instanceof Function) {
			_callback();
		}
		return false;
	}
}

function toggleLeftMenu(_callback) {
	if (!busy) {
		busy = true;
		var moveTo = 0,
		    mainView = parent.children[parent.children.length - 1];
		if (!menuOpen) {
			moveTo = LEFT_MENU_WIDTH;
		}
		menuOpen = !menuOpen;
		var animation = Ti.UI.createAnimation({
			left : moveTo,
			curve : Ti.UI.ANIMATION_CURVE_EASE_OUT,
			duration : MENU_SLIDING_DURATION
		});
		animation.addEventListener("complete", function onComplete() {
			animation.removeEventListener("complete", onComplete);
			mainView.left = moveTo;
			$.overlayView.visible = menuOpen;
			if (keyboard) {
				keyboard.hide();
			}
			busy = false;
			if (_callback) {
				_callback();
			}
		});
		mainView.animate(animation);
	}
}

function setMenuView(_view) {
	$.menuView.add(_view);
	var children = $.menuView.children;
	if (children.length > 1) {
		$.menuView.remove(children[0]);
	}
}

function setDuration(_duration) {
	MENU_SLIDING_DURATION = _duration;
}

function setMenuWidth(_width) {
	LEFT_MENU_WIDTH = _width;
	$.overlayView.left = LEFT_MENU_WIDTH;
	$.menuView.width = LEFT_MENU_WIDTH;
}

exports.init = init;
exports.terminate = terminate;
exports.enableDrag = enableDrag;
exports.disableDrag = disableDrag;
exports.setMenuView = setMenuView;
exports.setDuration = setDuration;
exports.setMenuWidth = setMenuWidth;
exports.openLeftMenu = openLeftMenu;
exports.closeLeftMenu = closeLeftMenu;
exports.toggleLeftMenu = toggleLeftMenu;
