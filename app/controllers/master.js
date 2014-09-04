var args = arguments[0] || {};
var _menuCtrl;

function init(e) {
	_menuCtrl = Alloy.createController("menu");
	$.drawer.init({
		parent : $.master,
		ctrls : Alloy.Collections.menuItems.pluck("ctrl"),
		menuView : _menuCtrl.getView()
	});
	$.drawer.openView(Alloy.Collections.menuItems.where({
	landingPage : true
	})[0].toJSON());
	$.master.open();
}

function destory(e) {
	_menuCtrl.destroy();
	$.drawer.destroy();
	$.master.close();
}

exports.init = init;
exports.destory = destory;
