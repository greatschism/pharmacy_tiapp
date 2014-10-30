var args = arguments[0] || {},
    app = require("core");

function didCloseToHome(e) {
	app.navigator.closeToHome();
}