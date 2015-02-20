var args = arguments[0] || {},
    utilities = require("utilities"),
    dialog = require("dialog");

function didClickSend(e) {
	if (utilities.validateEmail($.emailTxt.getValue())) {

	} else {
		dialog.show({
			message : Alloy.Globals.strings.valEmail
		});
	}
}
