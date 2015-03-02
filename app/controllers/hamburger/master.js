var args = arguments[0] || {},
    app = require("core"),
    menuCtrl;

function initHamburger() {
	app.globalWindow = $.window;
	app.init();
	app.setNavigator({
		type : "hamburger",
		hamburger : $.hamburger
	});
	menuCtrl = Alloy.createController("menu", {
		navigation : args.navigation
	});
	app.navigator.hamburger.init({
		menuView : menuCtrl.getView(),
		parent : $.window
	});
	if (args.triggerUpdate === true) {
		app.update();
	}
}

function didOpen() {
	if (!_.isEmpty(app.navigator)) {
		app.navigator.closeAll(function() {
			app.terminate();
			initHamburger();
		});
	} else {
		initHamburger();
	}
}

function didClose(e) {
	menuCtrl.terminate();
	app.navigator.hamburger.terminate();
}

$.window.open();
