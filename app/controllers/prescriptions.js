var args = arguments[0] || {}, App = require("core");

$.dropdown.setParentView(App.globalWindow);

function didClick(e) {
	console.log("go to home clicked!!!");
	App.Navigator.open(Alloy.Collections.menuItems.at(0).toJSON());
}