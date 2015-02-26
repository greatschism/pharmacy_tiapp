var args = arguments[0] || {},
    app = require("core"),
    utilities = require("utilities"),
    dialog = require("dialog");

function didClickSend(e) {
	var email = $.emailTxt.getValue();
	if (utilities.validateEmail(email)) {
		
	} else {
		dialog.show({
			message : Alloy.Globals.strings.valEmailRequired
		});
	}
}
