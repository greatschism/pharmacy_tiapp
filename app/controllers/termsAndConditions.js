var args = arguments[0] || {},
    app = require("core"),
    http = require("requestwrapper");

function init() {
	http.request({
		method : "TERMS_GET",
		data : {
			data : [{
				terms : ""
			}]
		},
		success : didSuccess
	});
}

function didSuccess(result) {
	Alloy.Collections.termsAndConditions.reset(result.data.terms);
}

function didClickItem(e) {
	var item = Alloy.Collections.termsAndConditions.at(e.index).toJSON();
	app.navigator.open({
		ctrl : "termsDoc",
		title : item.agreement_name,
		stack : true,
		ctrlArguments : item
	});
}

function didClickDone(e) {
	app.navigator.close();
}

function terminate() {
	$.destroy();
}

exports.init = init;
exports.terminate = terminate;
