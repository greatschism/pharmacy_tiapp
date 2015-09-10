function init() {
	$.uihelper.getImage("tip1", $.tip1Img);
	$.uihelper.getImage("tip2", $.tip2Img);
	$.uihelper.getImage("tip3", $.tip3Img);
}

function didClickSignIn() {
	$.app.navigator.open({
		titleid : "titleLogin",
		ctrl : "login",
		stack : false
	});
}

exports.init = init;
