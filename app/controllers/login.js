var args = arguments[0] || {},
    App = require("core");

function didRightclickPwd(e) {
	App.Navigator.open({
		ctrl : "loginRecovery",
		titleid : "loginRecovery",
		stack : true
	});
}
