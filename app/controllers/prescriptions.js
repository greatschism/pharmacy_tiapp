var args = arguments[0] || {};

function didClick(e) {
	console.log("go to home clicked!!!");
	Alloy.Globals.Navigator.openView(Alloy.Collections.menuItems.at(0).toJSON());
}