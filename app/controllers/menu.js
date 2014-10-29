var args = arguments[0] || {},
    app = require("core");

Alloy.Collections.menuItems.reset(Alloy.CFG.menuItems);
app.Navigator.open(Alloy.Collections.menuItems.where({
landingPage: true
})[0].toJSON());

function transformFunction(model) {
	var transform = model.toJSON();
	transform.title = Alloy.Globals.Strings[transform.titleid];
	return transform;
}

function didItemClick(e) {
	var item = Alloy.Collections.menuItems.at( OS_MOBILEWEB ? e.index : e.itemIndex).toJSON();
	app.Navigator.hamburger.closeLeftMenu(function() {
		if (item.ctrl && item.ctrl != app.Navigator.currentParams.ctrl) {
			app.Navigator.open(item);
		}
	});
}

function terminate() {
	$.destroy();
}

exports.terminate = terminate;
