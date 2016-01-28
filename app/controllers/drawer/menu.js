var args = arguments[0] || {},
    app = require("core"),
    navigationHandler = require("navigationHandler"),
    ctrlShortCode = require("ctrlShortCode"),
    analyticsHandler = require("analyticsHandler"),
    strings = Alloy.Globals.strings,
    icons = Alloy.CFG.icons,
    currentItem,
    marginLeft;

function init() {
	if (OS_ANDROID) {
		app.navigator.drawer.on("drawerclose", didDrawerclose);
	}
	marginLeft = $.createStyle({
		classes : ["i4"]
	}).font.fontSize + $.createStyle({
		classes : ["margin-left-medium"]
	}).left;
	Alloy.Collections.menuItems.trigger("reset");
}

function filterFunction(collection) {
	var fColl = [];
	collection.each(function(model) {
		if ((model.has("feature_name") && !Alloy.CFG[model.get("feature_name")]) || (model.has("platform") && _.indexOf(model.get("platform"), Alloy.CFG.platform) === -1)) {
			return false;
		}
		fColl.push(model);
	});
	return fColl;
}

function transformFunction(model) {
	var transform = model.toJSON();
	_.extend(transform, {
		left : marginLeft,
		icon : icons[transform.icon],
		title : strings[transform.menuTitleid || transform.titleid]
	});
	return transform;
}

function didDrawerclose(e) {
	if (!currentItem) {
		return false;
	}
	var navigation = Alloy.Collections.menuItems.findWhere({
		ctrl : currentItem
	}).toJSON();
	navigationHandler.navigate(navigation);
	analyticsHandler.featureEvent("DRAW-MENU-" + (ctrlShortCode[navigation.ctrl] || navigation.action || navigation.url));
	currentItem = null;
}

function didClickTableView(e) {
	var row = e.row;
	if (row) {
		currentItem = row.ctrl;
	}
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
