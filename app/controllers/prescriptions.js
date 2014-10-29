var args = arguments[0] || {},
    app = require("core");

_.map(Alloy.CFG.languages, function(obj) {
	obj.title = Alloy.Globals.Strings[obj.titleid];
});
$.dropdown.setChoices(Alloy.CFG.languages);
$.dropdown.setSelectedIndex(0);
$.dropdown.setParentView($.prescriptions);

function didClick(e) {
	console.log("go to home clicked!!!");
	app.Navigator.open(Alloy.Collections.menuItems.at(0).toJSON());
}