var args=arguments[0]||{};
function init(){
	$.uihelper.getImage("child_add",$.childSuccessImg);
}
function didClickAddChild(){
	$.app.navigator.open({
		titleid:"titleChildAdd",
		ctrl : "childAdd",
		stack : true
	});
}
function didClickContinue(){
	$.app.navigator.open({
		titleid:"titleLogin",
		ctrl : "login",
		stack : true
	});
}
exports.init=init;
