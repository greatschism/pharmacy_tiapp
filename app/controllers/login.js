var args = arguments[0] || {},
    authenticator = require("authenticator");

function init() {
	$.uihelper.getImage("logo", $.logoImg);
	Alloy.Models.patient.on("change:account", didChangeAccount);
	/**
	 * if auto login is enabled
	 * then auto populate the username and password
	 * behaviour can be controlled from theme flags
	 */
	if (authenticator.getAutoLoginEnabled()) {
		var data = authenticator.getData();
		$.usernameTxt.setValue(data.username);
		$.passwordTxt.setValue(data.password);
		$.autoLoginSwt.setValue(true);
	}
}

function didChangeAccount() {
	$.usernameTxt.setValue(Alloy.Models.patient.get("account"));
}

function didChangeToggle(e) {
	$.passwordTxt.setPasswordMask(!e.value);
}

function didChangeAutoLogin(e) {
	var value = e.value;
	authenticator.setAutoLoginEnabled(value);
	if (value) {
		$.uihelper.showDialog({
			message : $.strings.loginMsgAutoLogin
		});
	}
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
	var username = $.usernameTxt.getValue(),
	    password = $.passwordTxt.getValue();
	if (!username) {
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
	if ($.utilities.isPhoneNumber(username)) {
		//yet to handle
	} else {
		authenticator.init(didAuthenticate, null, username, password);
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
