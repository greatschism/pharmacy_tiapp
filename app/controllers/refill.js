var args = arguments[0] || {},
    App = require("core");

function didCloseToHome(e) {
	App.Navigator.closeToHome();
}