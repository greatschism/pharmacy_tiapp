var args = arguments[0] || {},
    app = require("core");

function didClickContinue(e) {
	app.navigator.open({
		ctrl : "sharedMobileCheck",
		titleImage : "/images/login/pharmacy.png",
		stack : true
	});
}
