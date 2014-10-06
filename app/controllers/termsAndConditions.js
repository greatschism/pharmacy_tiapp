var args = arguments[0] || {},
    App = require("core");

function didItemClick(e) {
	var item = Alloy.Collections.termsAndConditions.at( OS_MOBILEWEB ? e.index : e.itemIndex).toJSON();
	App.Navigator.open({
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

exports.init = init;
exports.terminate = terminate;
