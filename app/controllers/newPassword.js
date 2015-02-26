var args = arguments[0] || {},
    app = require("core"),
    dialog = require("dialog"),
    uihelper = require("uihelper"),
    http = require("requestwrapper"),
    utilities = require("utilities"),
    moment = require("alloy/moment");

function init(){
	$.hiLbl.text = String.format((Alloy.Globals.strings.strHi),"Swan");
}

function didClickDone(e) {
	var password = $.passwordTxt.getValue();

	if (!password) {
		dialog.show({
			message : Alloy.Globals.strings.valPasswordRequired
		});
		return;
	}
	if (!utilities.validatePassword(password)) {
		dialog.show({
			message : Alloy.Globals.strings.msgPasswordTips
		});
		return;
	}
}

function handleScroll(e) {
	$.newPassword.canCancelEvents = e.value;
}

exports.init = init;

