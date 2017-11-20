var args = $.args;

function init()
{
	$.uihelper.getImage("expcheckout_benefits", $.expCheckoutBenefitsImage);
}

function didClickDone(){
		$.app.navigator.open({
			titleid : "titleHomePage",
			ctrl : "home",
			stack : false
		});
}
exports.init = init;
