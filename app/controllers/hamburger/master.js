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
	app.Navigator.hamburger.init({
		menuView : menuCtrl.getView()
	});
}

function didOpen() {
	if (!_.isEmpty(app.Navigator)) {
		app.Navigator.closeToHome(function() {
			app.Navigator.close(1, function() {
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
	app.Navigator.hamburger.terminate();
	app.terminate();
}

$.window.open();
