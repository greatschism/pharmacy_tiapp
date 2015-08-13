var args = arguments[0] || {};

function init() {
	$.uihelper.getImage("text_benefits", $.textBenefitsImage);
}

function didClickTextSignup() {
	$.app.navigator.open({
		titleid : "titleChangePhone",
		ctrl : "phone",
		stack : true
	});
}

function didClickSkipTextSignup() {
	$.app.navigator.open({
		titleid : "titleHome",
		ctrl : "home",
		stack : false
	});
}

exports.init = init;
