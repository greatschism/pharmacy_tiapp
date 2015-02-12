var args = arguments[0] || {},
    app = require("core");

function didClickContinue(e) {
	app.navigator.open({
		ctrl : "sharedMobileCheck",
		titleid : "",
		stack : true
	});
}


function didClickDidntGetText(e) {
	app.navigator.open({
		ctrl : "didntgetText",
		titleid : "titleTextHelp",
		stack : true
	});
}