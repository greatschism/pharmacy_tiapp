var args = arguments[0] || {},
	app = require("core");

function init() {
	$.emailTxt.setValue(Alloy.Models.patient.get("email_address") || $.strings.strNotAvailable);
	var len = $.emailTxt.getValue().length;
	$.emailTxt.setSelection(0, len);
}

function didClickDone(){
	app.navigator.close();
}

exports.init = init;