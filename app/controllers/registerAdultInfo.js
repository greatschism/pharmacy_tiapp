var args = arguments[0] || {};
function init(){
$.uihelper.getImage("adult", $.adultImg);
}
function didClickContinue(){
	$.app.navigator.open({
		titleid:"titleCreateAccount",
		ctrl : "mgrAccountCreation",
		stack : true
	});
}

exports.init=init;