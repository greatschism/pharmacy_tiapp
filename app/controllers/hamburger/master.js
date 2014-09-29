var args = arguments[0] || {}, App = require("core"), _menuCtrl;

(function() {
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

	$.window.open();
})();

function didClose(e) {
	_menuCtrl.terminate();
	App.Navigator.hamburger.terminate();
	App.terminate();
}