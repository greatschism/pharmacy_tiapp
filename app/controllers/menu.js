var args = arguments[0] || {}, App = require("core");
Alloy.Collections.menuItems.reset(Alloy.CFG.menuItems);
App.Navigator.open(Alloy.Collections.menuItems.where({
landingPage: true
})[0].toJSON());

function transformFunction(model) {
	var transform = model.toJSON();
	transform.title = Alloy.Globals.Strings[transform.titleid];
	return transform;
}

function didItemClick(e) {
	var item = Alloy.Collections.menuItems.at( OS_MOBILEWEB ? e.index : e.itemIndex).toJSON();
	if (item.ctrl && item.ctrl != App.Navigator.currentParams.ctrl) {
		App.Navigator.open(item);
	}
	App.Navigator.hamburger.closeLeftMenu();
}

function terminate(){
	$.destroy();
}

exports.terminate = terminate;