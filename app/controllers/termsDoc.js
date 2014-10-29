var args = arguments[0] || {},
    app = require("core");

function didClickDone(e) {
	app.Navigator.close();
}