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
	menuCtrl = Alloy.createController("menu");
	app.navigator.hamburger.init({
		menuView : menuCtrl.getView(),
		parent : $.window
	});
}

function didOpen() {
	if (!_.isEmpty(app.navigator)) {
		app.navigator.closeToHome(function() {
			app.navigator.close(1, function() {
				app.terminate();
				initHamburger();
			});
		});
	} else {
		initHamburger();
	}
}

function didClose(e) {
	menuCtrl.terminate();
	app.navigator.hamburger.terminate();
	app.terminate();
}

$.window.open();
