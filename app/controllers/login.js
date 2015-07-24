var args = arguments[0] || {},
    authenticator = require("authenticator");

function init() {
	$.uihelper.getImage("logo", $.logoImg);
	Alloy.Models.patient.on("change:account", didChangeAccount);
}

function didChangeAccount() {
	$.unameTxt.setValue(Alloy.Models.patient.get("account"));
}

function moveToNext(e) {
	var nextItem = e.nextItem || false;
	if (nextItem && $[nextItem]) {
		$[nextItem].focus();
	} else {
		didClickLogin();
	}
}

function didClickLogin(e) {
	var uname = $.unameTxt.getValue(),
	    password = $.passwordTxt.getValue();
	if (!uname) {
		$.uihelper.showDialog({
			message : $.strings.loginValUsername
		});
		return;
	}
	if (!password) {
		$.uihelper.showDialog({
			message : $.strings.loginValPassword
		});
		return;
	}
	if ($.utilities.isPhoneNumber(uname)) {
		//yet to handle
	} else {
		authenticator.init(didAuthenticate, null, uname, password, $.keepMeSwt.getValue());
	}
}

function didAuthenticate() {
	$.app.navigator.open(args.navigation || Alloy.Collections.menuItems.findWhere({
		landing_page : true
	}).toJSON());
}

function didClickPassword(e) {

}

function didClickCreateAccount(e) {

}

function terminate() {
	Alloy.Models.patient.off("change:account", didChangeAccount);
	Alloy.Models.patient.set({
		account : null
	});
}

exports.init = init;
exports.terminate = terminate;
