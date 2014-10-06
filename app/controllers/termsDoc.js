var args = arguments[0] || {},
    App = require("core");

function didClickDone(e) {
	App.Navigator.close();
}