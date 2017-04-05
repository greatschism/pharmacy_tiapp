var args = $.args;

function init(){
	$.uihelper.getImage("adult", $.adultImg);
	$.__views.adultImg.accessibilityHidden  = true;
}

function didClickContinue(){
	$.app.navigator.open({
		titleid:"titleCreateAccount",
		ctrl : "mgrAccountCreation",
		stack : true
	});
}

exports.init=init;