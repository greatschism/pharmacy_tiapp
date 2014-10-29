var args = arguments[0] || {},
    app = require("core");

function didClickContinue(e) {
	app.Navigator.open({
		ctrl : "fullSignup",
		stack : true
	});
}