var args = arguments[0] || {},
	app = require("core");

function init() {
	$.emailTxt.setValue(Alloy.Models.patient.get("email_address") || $.strings.strNotAvailable);
}

function didClickDone(){
	app.navigator.close();
}

exports.init = init;