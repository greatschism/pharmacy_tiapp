var args = arguments[0] || {},
    app = require("core");

function didClickDone(e) {
	app.navigator.close();
}