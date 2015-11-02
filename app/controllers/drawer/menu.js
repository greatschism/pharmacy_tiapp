var args = arguments[0] || {},
    app = require("core"),
    uihelper = require("uihelper"),
    navigationHandler = require("navigationHandler"),
    strings = Alloy.Globals.strings,
    icons = Alloy.CFG.icons,
    currentIndex = -1;

function init() {
	if (OS_ANDROID) {
		app.navigator.drawer.on("drawerclose", didDrawerclose);
	}
	uihelper.getImage("logo_white", $.logoImg);
	Alloy.Collections.menuItems.trigger("reset");
}

function transformFunction(model) {
	var transform = model.toJSON();
	transform.icon = icons[transform.icon];
	transform.title = strings[transform.menuTitleid || transform.titleid];
	return transform;
}

function didDrawerclose(e) {
	if (currentIndex == -1) {
		return false;
	}
	navigationHandler.navigate(Alloy.Collections.menuItems.at(currentIndex).toJSON());
	currentIndex = -1;
}

function didClickTableView(e) {
	currentIndex = e.index;
	app.navigator.drawer.toggleLeftWindow();
	if (OS_IOS) {
		didDrawerclose();
	}
}

function terminate() {
	if (OS_ANDROID) {
		app.navigator.drawer.off("drawerclose", didDrawerclose);
	}
	$.destroy();
}

exports.init = init;
exports.terminate = terminate;
