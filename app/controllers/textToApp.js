var args = arguments[0] || {},
    App = require("core");

function didClickContinue(e) {
	App.Navigator.open({
		ctrl : "sharedMobileCheck",
		titleImage : "/images/login/pharmacy.png",
		stack : true
	});
}
