var args = arguments[0] || {},
    LEFT_MENU_WIDTH = 240,
    MENU_SLIDING_DURATION = 100,
    menuOpen = false,
    busy = false;

function orientationChanged(e) {
	var newWidth;
	newWidth = Ti.Platform.displayCaps.platformWidth;
	if (OS_ANDROID)
		newWidth /= Ti.Platform.displayCaps.logicalDensityFactor;
	$.mainView.width = newWidth;
}

function didTapOverlay(e) {
	if (menuOpen) {
		closeLeftMenu();
	}
}

function init(params) {
	if (_.has(params, "menuView")) {
		$.setMenuView(params.menuView);
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
		$.menuView.remove(children[1]);
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

exports.init = init;
exports.terminate = terminate;
exports.setMenuView = setMenuView;
exports.setDuration = setDuration;
exports.setMenuWidth = setMenuWidth;
exports.openLeftMenu = openLeftMenu;
exports.closeLeftMenu = closeLeftMenu;
exports.toggleLeftMenu = toggleLeftMenu;
