var TAG = "NAHA",
    Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    app = require("core"),
    utilities = require("utilities"),
    uihelper = require("uihelper");

function navigate(itemObj) {
	if (_.has(itemObj, "ctrl")) {
		loginOrNavigate(itemObj);
	} else if (_.has(itemObj, "url")) {
		var url = itemObj.url;
		if (OS_IOS && _.has(itemObj, "alternate_url") && Ti.Platform.canOpenURL(url) === false) {
			url = itemObj.alternate_url;
		}
		Ti.Platform.openURL(url);
	} else if (_.has(itemObj, "action")) {
		switch(itemObj.action) {
		case "logout":
			uihelper.showDialog({
				message : Alloy.Globals.strings.msgLogoutConfirm,
				buttonNames : [Alloy.Globals.strings.dialogBtnYes, Alloy.Globals.strings.dialogBtnNo],
				cancelIndex : 1,
				success : logout
			});
			break;
		}
	}
}

function loginOrNavigate(itemObj) {
	var ctrlPath = app.navigator.currentController.ctrlPath;
	if (itemObj.ctrl != ctrlPath) {
		if (itemObj.requires_login && !Alloy.Globals.isLoggedIn) {
			if (ctrlPath != "login") {
				app.navigator.open({
					titleid : "titleLogin",
					ctrl : "login",
					ctrlArguments : {
						navigation : itemObj
					}
				});
			}
		} else {
			app.navigator.open(itemObj);
		}
	}
}

function logout() {
	require("authenticator").logout({
		dialogEnabled : true
	});
}

exports.navigate = navigate;
