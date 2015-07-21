var args = arguments[0] || {};

function init() {
	$.uihelper.getImage("success", $.successImg);
}

function didClickSignup(e) {
	$.app.navigator.open({
		titleid : "titleSignup",
		ctrl : "signup"
	});
}

exports.init = init;
