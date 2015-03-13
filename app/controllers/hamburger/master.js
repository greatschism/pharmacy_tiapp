var args = arguments[0] || {},
    app = require("core"),
    uihelper = require("uihelper");

function initHamburger() {
	app.init({
		drawer : $.drawer,
		navigationWindow : $.navigationWindow || null,
		rootWindow : $.rootWindow,
		type : "hamburger"
	});
	$.menuCtrl.init(args.navigation);
	if (args.triggerUpdate === true) {
		app.update();
	}
}

function didOpen() {
	if (!_.isEmpty(app.navigator)) {
		app.navigator.closeToRoot();
		if (app.drawer) {
			app.drawer.close();
		}
		app.terminate();
	}
	initHamburger();
	$.drawer.centerWindow.accessibilityHidden = false;
	$.drawer.leftWindow.accessibilityHidden = false;
}

function didLeftWindowOpen(e) {
	uihelper.requestForFocus($.menuCtrl.getView());
}

function didClose(e) {
	$.menuCtrl.terminate();
}

$.drawer.open();
