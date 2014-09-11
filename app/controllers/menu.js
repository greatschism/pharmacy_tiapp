var args = arguments[0] || {}, App = require("core");
Alloy.Collections.menuItems.reset(Alloy.CFG.menuItems);
App.Navigator.open(Alloy.Collections.menuItems.where({
landingPage: true
})[0].toJSON());

function didItemClick(e) {
	var item = Alloy.Collections.menuItems.at( OS_MOBILEWEB ? e.index : e.itemIndex).toJSON();
	if (item.ctrl != App.Navigator.currentItem.ctrl) {
		App.Navigator.open(item);
	}
	App.hamburger.closeLeftMenu();
}