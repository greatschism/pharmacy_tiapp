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
		case "refill":
			if (Alloy.CFG.is_quick_refill_enabled && Alloy.CFG.is_refill_by_scan_enabled) {
				app.navigator.open({
					titleid : "titleRefill",
					ctrl : "refill"
				});
			} else if (Alloy.CFG.is_quick_refill_enabled) {
				app.navigator.open({
					titleid : "titleRefillType",
					ctrl : "refillType"
				});
			} else if (Alloy.CFG.is_refill_by_scan_enabled) {
				/**
				 * open barcode scanner directly
				 * when phone number is disabled
				 */
				if (Alloy.CFG.refill_scan_phone_enabled) {
					app.navigator.open({
						titleid : "titleRefill",
						ctrl : "refillPhone"
					});
				} else {
					require("refillScan").init(app.navigator.currentController);
				}
			} else {
				uihelper.showDialog({
					message : Alloy.Globals.strings.msgFeatureNotAvailable,
					buttonNames : [Alloy.Globals.strings.dialogBtnOK]
				});
			}
			break;
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
	else if (_.has(itemObj, "menu_url")) {
		
		var title = "title"+itemObj.menu_url[0].toUpperCase() + itemObj.menu_url.substring(1);
		
		app.navigator.open({
				titleid : title,
				ctrl : "dynamicMenuOption",
				ctrlArguments : {
					menu_url : itemObj.menu_url
				}
			});	
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