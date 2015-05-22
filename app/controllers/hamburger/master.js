var args = arguments[0] || {},
    app = require("core"),
    uihelper = require("uihelper");

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
		$.rootWindow = Alloy.CFG.DRAWER_LAYOUT ? e.source : this;
		$.rootWindow.addEventListener("close", didClose);
		$.rootWindow.addEventListener("androidback", didAndoridBack);
	}
	$.trigger("open");
	if (!_.isEmpty(app.navigator)) {
		app.terminate();
	}
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

function didAndoridBack(e) {
	app.navigator.close(1, true);
}

function didLeftWindowOpen(e) {
	if (OS_IOS) {
		uihelper.requestViewFocus($.menuCtrl.getView());
	}
}

function didClose(e) {
	$.menuCtrl.terminate();
}

exports.init = init;
