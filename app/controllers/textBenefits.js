var args = arguments[0] || {};

function init() {
	$.uihelper.getImage("text_benefits", $.textBenefitsImage);

}

function didClickTextSignup() {

}

function didClickSkipTextSignup() {
	$.app.navigator.open({
		titleid : "titleHome",
		ctrl : "home",
		stack : false
	});
}

exports.init = init;
