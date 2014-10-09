var args = arguments[0] || {},
    App = require("core");

function didRightclickPwd(e) {
	App.Navigator.open({
		ctrl : "loginRecovery",
		titleid : "loginRecovery",
		stack : true
	});
}

function moveToNext(e) {
	var nextItem = e.nextItem || "";
	$[nextItem] && $[nextItem].focus();
}

function handleScroll(e) {
	$.scrollView.canCancelEvents = e.value;
}