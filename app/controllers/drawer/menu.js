var args = arguments[0] || {},
    app = require("core"),
    uihelper = require("uihelper"),
    navigationHandler = require("navigationHandler"),
    strings = Alloy.Globals.strings,
    icons = Alloy.CFG.icons,
    currentIndex = -1;

function init(navigation, navigationHandled) {
	if (OS_ANDROID) {
		app.navigator.drawer.addEventListener("drawerclose", didDrawerclose);
	}
	Alloy.Collections.menuItems.trigger("reset");
	if (!navigationHandled) {
		app.navigator.open(navigation || Alloy.Collections.menuItems.findWhere({
			landing_page : true
		}).toJSON());
	}
}

function filterFunction(collection) {
	$.menu.applyProperties(Alloy.TSS.menu_view);
	uihelper.getImage("logo_white", $.logoImg);
	return collection.models;
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
		app.navigator.drawer.removeEventListener("drawerclose", didDrawerclose);
	}
	$.destroy();
}

exports.init = init;
exports.terminate = terminate;
