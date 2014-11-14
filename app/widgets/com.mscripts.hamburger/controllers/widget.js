var args = arguments[0] || {},
    LEFT_MENU_WIDTH = 240,
    MENU_SLIDING_DURATION = 100,
    keyboard = OS_IOS || OS_ANDROID ? require("ti.keyboard") : false,
    menuOpen = false,
    listenForDrag = false,
    touchStartX = 0,
    touchStarted = false,
    busy = false;

function orientationChanged(e) {
	var newWidth;
	newWidth = Ti.Platform.displayCaps.platformWidth;
	if (OS_ANDROID)
		newWidth /= Ti.Platform.displayCaps.logicalDensityFactor;
	$.mainView.width = newWidth;
}

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
	}, $.widget);
	var _x = parseInt(coords.x, 10);
	var newLeft = _x - touchStartX;
	if (OS_ANDROID) {
		newLeft /= Ti.Platform.displayCaps.logicalDensityFactor;
	}
	if (touchStarted && newLeft >= 0 && newLeft <= LEFT_MENU_WIDTH) {
		$.mainView.left = newLeft;
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
	}, $.widget);
	var _x = parseInt(coords.x, 10);
	if (!menuOpen && _x >= LEFT_MENU_WIDTH / 2) {
		openLeftMenu();
	} else {
		menuOpen = true;
		closeLeftMenu();
	}
}

function init(params) {
	if (_.has(params, "menuView")) {
		$.setMenuView(params.menuView);
	}
	if (params.disableDrag !== true) {
		enableDrag();
	}
	//calling orientationChanged to apply width to mainView - Do not remove
	orientationChanged();
	//Ti.Gesture.addEventListener("orientationchange", orientationChanged);
}

function terminate(params) {
	//Ti.Gesture.removeEventListener("orientationchange", orientationChanged);
}

function openLeftMenu(callback) {
	if (!menuOpen) {
		toggleLeftMenu(callback);
		return true;
	} else {
		if (callback) {
			callback();
		}
		return false;
	}
}

function closeLeftMenu(callback) {
	if (menuOpen) {
		toggleLeftMenu(callback);
		return true;
	} else {
		if (callback && callback instanceof Function) {
			callback();
		}
		return false;
	}
}

function toggleLeftMenu(callback) {
	if (!busy) {
		busy = true;
		var moveTo = 0;
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
			$.mainView.left = moveTo;
			$.overlayView.visible = menuOpen;
			if (keyboard) {
				keyboard.hide();
			}
			busy = false;
			if (callback) {
				callback();
			}
		});
		$.mainView.animate(animation);
	}
}

function setMenuView(view) {
	$.menuView.add(view);
	var children = $.menuView.children;
	if (children.length > 1) {
		$.menuView.remove(children[0]);
	}
}

function setDuration(duration) {
	MENU_SLIDING_DURATION = duration;
}

function setMenuWidth(width) {
	LEFT_MENU_WIDTH = width;
	$.overlayView.left = LEFT_MENU_WIDTH;
	$.menuView.width = LEFT_MENU_WIDTH;
}

function getContentView() {
	return $.mainView;
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
exports.getContentView = getContentView;
