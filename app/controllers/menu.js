var args = arguments[0] || {};
Alloy.Collections.menuItems.reset(Alloy.CFG.menuItems);

function didItemClick(e) {
	Alloy.Globals.Navigator.openView(Alloy.Collections.menuItems.at( OS_MOBILEWEB ? e.index : e.itemIndex).toJSON());
}