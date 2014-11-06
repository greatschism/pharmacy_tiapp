var args = arguments[0] || {},
    app = require("core");

function didClickContinue(e) {
	app.navigator.open({
		ctrl : "sharedMobileCheck",
		titleImage : "/images/pharmacy_gray.png",
		stack : true
	});
}
