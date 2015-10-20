var args = arguments[0] || {},
    moment = require("alloy/moment"),
    app = require("core"),
    uihelper = require("uihelper"),
    notificationPanel = require("notificationPanel"),
    authenticator = require("authenticator"),
    reload = false;

function init() {
	if (OS_IOS) {
		/**
		 * On iOS apps can stay longer in background
		 * so there are chances for user to lose updates
		 * from appload. To avoid that if app resumes
		 * from background after appload_timeout time,
		 * then reload it
		 */
		Ti.App.addEventListener("paused", didAppPaused);
		Ti.App.addEventListener("resumed", didAppResumed);
		//drawer window events
		$.drawer.addEventListener("open", didOpen);
		$.drawer.addEventListener("close", didClose);
		$.drawer.addEventListener("windowDidOpen", windowDidOpen);
	}
	if (OS_ANDROID) {
		$.rootWindow = $.drawer.getView();
		$.rootWindow.addEventListener("open", didOpen);
		$.rootWindow.addEventListener("close", didClose);
		$.rootWindow.addEventListener("androidback", didAndoridBack);
		/**
		 * to hide keyboard when drawer slides
		 */
		$.drawer.addEventListener("draweropen", hideKeyboard);
	}
	$.drawer.open();
}

function didAppPaused(e) {
	Alloy.Globals.latestActive = moment().unix();
	/**
	 * reset active flag
	 * for notification panel
	 */
	notificationPanel.active = false;
}

function didAppResumed(e) {
	var now = moment().unix();
	if ((now - Alloy.Globals.latestActive) > Alloy.CFG.appload_timeout) {
		doLogout();
	} else {
		Alloy.Globals.latestActive = now;
		/**
		 * set active flag
		 * for notification panel
		 */
		notificationPanel.active = true;
	}
}

function didOpen(e) {
	if (OS_IOS) {
		$.drawer.centerWindow.accessibilityHidden = false;
		$.drawer.leftWindow.accessibilityHidden = false;
	}
	if (OS_ANDROID) {
		var actionBar = $.rootWindow.activity.actionBar;
		if (actionBar) {
			actionBar.setDisplayHomeAsUp(true);
			actionBar.setOnHomeIconItemSelected(function() {
				/**
				 * hide keyboard when drawer is opened
				 * fails some time, so do it before
				 * window is toggled
				 */
				hideKeyboard();
				$.drawer.toggleLeftWindow();
			});
		}
	}
	$.trigger("init");
	if (!_.isEmpty(app.navigator)) {
		app.terminate();
	}
	app.init({
		type : "drawer",
		drawer : $.drawer,
		navigationWindow : $.navigationWindow || null,
		rootWindow : $.rootWindow
	});
	/**
	 * in both the cases
	 * landing page should be opened
	 * and update should be triggered
	 * the failure callback will also
	 * prevent authenticator from
	 * opening login screen
	 */
	authenticator.init({
		success : didAuthenticate,
		failure : didAuthenticate
	});
}

/**
 * navigationHandled - whether or not to
 * initiate a navigation.
 */
function didAuthenticate(navigationHandled) {
	$.menuCtrl.init(args.navigation, navigationHandled);
	/**
	 * set active flag
	 * for notification panel
	 */
	notificationPanel.active = true;
	/**
	 * usually this is a async
	 * update, sync updates
	 * will be done on appload
	 * controller itself
	 */
	if (args.triggerUpdate === true) {
		app.update(didCompleteUpdate);
	}
}

function didCompleteUpdate() {
	reload = ture;
	doLogout();
}

function doLogout() {
	/**
	 * logout before reloading the app
	 * Note: this is not a explicit logout
	 */
	authenticator.logout({
		explicit : false,
		success : didLogout
	});
}

function didLogout() {
	/**
	 * app level ios events
	 */
	if (OS_IOS) {
		Ti.App.removeEventListener("paused", didAppPaused);
		Ti.App.removeEventListener("resumed", didAppResumed);
	}
	/**
	 * make the heavy weight window
	 * ready for close not exit
	 * and initiate appload again
	 */
	if (OS_ANDROID) {
		$.rootWindow.setExitOnClose(false);
	}
	/**
	 * reset active flag
	 * for notification panel
	 */
	notificationPanel.active = false;
	/**
	 * reload flag reloads the updated
	 * Note: no need to listen for init
	 * and close this window, navigator
	 * will be destroyed whenever
	 * new one is created
	 */
	Alloy.createController("appload", {
		reload : reload
	}).init();
}

function didAndoridBack(e) {
	app.navigator.close(1, true);
}

function windowDidOpen(e) {
	uihelper.requestViewFocus($.menuCtrl.getView());
}

function hideKeyboard(e) {
	/**
	 * hide keyboard if any
	 * PHA-1156 - #3
	 * Note: for iOS the same below is handled
	 * in ios/drawer/window.js before opening
	 * the window. iOS itself hides
	 * the keyboard and showing it back
	 * after left window animation, so keyboard
	 * should be hidden before open animation.
	 */
	if (Ti.App.keyboardVisible) {
		Ti.App.hideKeyboard();
	}
}

function didClose(e) {
	//destroy menu view (data binding)
	$.menuCtrl.terminate();
}

exports.init = init;
