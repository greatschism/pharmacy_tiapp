var args = arguments[0] || {}, App = require("core"), _menuCtrl;

App.globalWindow = $.window;
App.hamburger = $.hamburger;
App.init();

_menuCtrl = Alloy.createController("menu");
App.hamburger.init({
	menuView : _menuCtrl.getView()
});

$.window.open();

function didClose(e) {
	App.hamburger.destroy();
	_menuCtrl.destroy();
}