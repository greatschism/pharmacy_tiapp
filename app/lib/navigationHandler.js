var TAG = "navigationHandler",
    Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    app = require("core"),
    uihelper = require("uihelper"),
    strings = Alloy.Globals.strings;

function navigate(itemObj) {
	if (_.has(itemObj, "ctrl")) {
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
	} else if (_.has(itemObj, "url")) {
		var url = itemObj.url;
		if (OS_IOS && _.has(itemObj, "alternate_url") && Ti.Platform.canOpenURL(url) === false) {
			url = itemObj.alternate_url;
		}
		Ti.Platform.openURL(url);
	} else if (_.has(itemObj, "action")) {
		switch(itemObj.action) {
		case "reminders":
			console.log("yet to implement");
			break;
		case "logout":
			uihelper.showDialog({
				message : strings.msgLogoutConfirm,
				buttonNames : [strings.dialogBtnYes, strings.dialogBtnNo],
				cancelIndex : 1,
				success : logout
			});
			break;
		}
	}
}

function logout() {
	require("authenticator").logout({
		dialogEnabled : true
	});
}

exports.navigate = navigate;
