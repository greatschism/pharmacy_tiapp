var args = $.args,
navigationHandler = require("navigationHandler");

function didClickRegister(){
	if(Alloy.CFG.is_proxy_enabled)
	{
		$.app.navigator.open({
			titleid : "titleRegister",
			ctrl : "register"
		});
	}
	else
	{
		$.app.navigator.open({
			ctrl : "signup",
			titleid : "titleCreateAccount"
		});
	}
}

function didClickSkip(){
	navigationHandler.navigate(Alloy.Collections.menuItems.findWhere({
			landing_page : true
		}).toJSON());
}

function init() {
	$.lbl.text = $.strings.reRegister_welcome;
	$.lbl2.text = $.strings.reRegister_message;
	Alloy.Globals.carouselFlow = true;
}

exports.init = init;