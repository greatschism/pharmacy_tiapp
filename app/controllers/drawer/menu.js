var args = arguments[0] || {},
    app = require("core"),
    navigationHandler = require("navigationHandler"),
    ctrlShortCode = require("ctrlShortCode"),
    analyticsHandler = require("analyticsHandler"),
    strings = Alloy.Globals.strings,
    icons = Alloy.CFG.icons,
    currentIndex = -1;

function init() {
	if (OS_ANDROID) {
		app.navigator.drawer.on("drawerclose", didDrawerclose);
	}
	Alloy.Collections.menuItems.trigger("reset");
}

function filterFunction(collection) {
	var fColl = [];
	collection.each(function(model) {
		if ((model.has("feature_name") && !parseInt(Alloy.Models.appload.get("features")[model.get("feature_name")])) || (model.has("platform") && _.indexOf(model.get("platform"), Alloy.CFG.platform) === -1)) {
			return false;
		}
		fColl.push(model);
	});
	return fColl;
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
	var navigation = Alloy.Collections.menuItems.at(currentIndex).toJSON();
	navigationHandler.navigate(navigation);
	analyticsHandler.featureEvent("DRAW-MENU-" + (ctrlShortCode[navigation.ctrl] || navigation.action || navigation.url));
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
