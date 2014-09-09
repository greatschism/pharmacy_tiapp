var args = arguments[0] || {}, _selectedIndex, App = require("core");

(function() {

	Alloy.Collections.menuItems.reset(Alloy.CFG.menuItems);

	var landingPage = Alloy.Collections.menuItems.where({
	landingPage: true
	})[0];

	_selectedIndex = Alloy.Collections.menuItems.indexOf(landingPage);

	App.Navigator.open(landingPage.toJSON());
})();

function didItemClick(e) {
	var index = OS_MOBILEWEB ? e.index : e.itemIndex;
	if (_selectedIndex !== index) {
		_selectedIndex = index;
		App.Navigator.open(Alloy.Collections.menuItems.at(_selectedIndex).toJSON());
	}
	App.hamburger.closeLeftMenu();
}