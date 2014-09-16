var args = arguments[0] || {}, App = require("core"), _menuCtrl;

App.globalWindow = $.window;
App.Hamburger = $.hamburger;
App.init();

_menuCtrl = Alloy.createController("menu");
App.Hamburger.init({
	menuView : _menuCtrl.getView()
});

$.window.open();

function didClose(e) {
	App.Hamburger.destroy();
	_menuCtrl.destroy();
}