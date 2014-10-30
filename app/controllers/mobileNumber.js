var args = arguments[0] || {},
    app = require("core");

function didClickContinue(e) {
	app.navigator.open({
		ctrl : "fullSignup",
		stack : true
	});
}