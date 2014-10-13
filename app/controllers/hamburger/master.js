var args = arguments[0] || {},
    App = require("core"),
    _menuCtrl;

function initHamburger() {
	App.globalWindow = $.window;
	App.init();
	App.setNavigator({
		type : "hamburger",
		hamburger : $.hamburger
	});
	_menuCtrl = Alloy.createController("menu");
	App.Navigator.hamburger.init({
		menuView : _menuCtrl.getView()
	});
}

function didOpen() {
	if (!_.isEmpty(App.Navigator)) {
		App.Navigator.closeToHome(function() {
			App.Navigator.close(1, function() {
				App.terminate();
				initHamburger();
			});
		});
	} else {
		initHamburger();
	}
}

function didClose(e) {
	_menuCtrl.terminate();
	App.Navigator.hamburger.terminate();
	App.terminate();
}

$.window.open();
