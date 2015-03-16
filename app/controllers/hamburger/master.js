var args = arguments[0] || {},
    app = require("core"),
    uihelper = require("uihelper");

function initHamburger() {
	app.init({
		type : "hamburger",
		drawer : $.drawer,
		navigationWindow : $.navigationWindow || null,
		rootWindow : $.rootWindow
	});
	$.menuCtrl.init(args.navigation);
	if (args.triggerUpdate === true) {
		app.update(updateCallback);
	}
}

function updateCallback() {
	app.navigator.open(_.findWhere(Alloy.Collections.menuItems.toJSON(), {
		landing_page : true
	}));
	Alloy.Collections.menuItems.trigger("reset");
}

function didOpen() {
	if (!_.isEmpty(app.navigator)) {
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
