var args = arguments[0] || {},
    app = require("core"),
    uihelper = require("uihelper"),
    authenticator = require("authenticator");

function init() {
	if (OS_IOS) {
		$.drawer.addEventListener("open", didOpen);
		$.drawer.addEventListener("close", didClose);
		$.drawer.addEventListener("windowDidOpen", didLeftWindowOpen);
	}
	if (OS_ANDROID) {
		$.drawer.getView().addEventListener("open", didOpen);
	}
	$.drawer.open();
}

function didOpen(e) {
	if (OS_IOS) {
		$.drawer.centerWindow.accessibilityHidden = false;
		$.drawer.leftWindow.accessibilityHidden = false;
	}
	if (OS_ANDROID) {
		$.rootWindow = e.source;
		$.rootWindow.addEventListener("close", didClose);
		$.rootWindow.addEventListener("androidback", didAndoridBack);
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
 * usually this is a async
 * update, sync updates
 * will be done on appload
 * controller itself
 */
function didAuthenticate() {
	$.menuCtrl.init(args.navigation);
	if (args.triggerUpdate === true) {
		app.update(updateCallback);
	}
}

function updateCallback() {
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
	 * make the heavy weight window
	 * ready for close not exit
	 * and initate appload again
	 */
	if (OS_ANDROID) {
		$.rootWindow.setExitOnClose(false);
	}
	Alloy.createController("appload");
}

function didAndoridBack(e) {
	app.navigator.close(1, true);
}

function didLeftWindowOpen(e) {
	uihelper.requestViewFocus($.menuCtrl.getView());
}

function didClose(e) {
	$.menuCtrl.terminate();
}

exports.init = init;
