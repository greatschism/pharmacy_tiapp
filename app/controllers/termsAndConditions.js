var args = arguments[0] || {},
    app = require("core");

function didItemClick(e) {
	var item = Alloy.Collections.termsAndConditions.at(e.index).toJSON();
	app.navigator.open({
		ctrl : "termsDoc",
		ctrlArguments : {
			url : item.url
		},
		title : item.name,
		stack : true
	});
}

function init() {
	Alloy.Collections.termsAndConditions.reset([{
		name : "Terms of Service",
		url : ""
	}, {
		name : "Privacy Policy",
		url : ""
	}, {
		name : "Rx.com Terms and Service",
		url : ""
	}]);
}

function terminate() {
	$.destroy();
}

function didDoneClick(e) {
	app.navigator.open({
		ctrl : "mobileNumber",
		titleid : "titleMobileNumber",
		stack : true
	});
}

exports.init = init;
exports.terminate = terminate;
