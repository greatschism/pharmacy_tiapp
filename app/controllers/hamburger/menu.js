var args = arguments[0] || {},
    app = require("core"),
    uihelper = require("uihelper"),
    http = require("requestwrapper"),
    icons = Alloy.CFG.icons,
    currentIndex = -1,
    landingPage;

function init(navigation) {
	if (OS_ANDROID) {
		app.navigator.drawer.addEventListener("drawerclose", didDrawerclose);
	}
	landingPage = _.findWhere(Alloy.Collections.menuItems.toJSON(), {
		landing_page : true
	});
	Alloy.Collections.menuItems.trigger("reset");
	app.navigator.open(navigation || landingPage);
}

function filterFunction(collection) {
	$.menu.applyProperties(Alloy.TSS.menu_view);
	uihelper.getImage("logo_white", $.logoImg);
	return collection.models;
}

function transformFunction(model) {
	var transform = model.toJSON();
	transform.icon = icons[transform.icon];
	transform.title = Alloy.Globals.strings[transform.titleid];
	return transform;
}

function didDrawerclose(e) {
	if (currentIndex == -1) {
		return false;
	}
	var model = Alloy.Collections.menuItems.at(currentIndex),
	    itemObj = model.toJSON();
	if (_.has(itemObj, "ctrl")) {
		var ctrlPath = app.navigator.currentController.ctrlPath;
		if (itemObj.ctrl != ctrlPath) {
			if (itemObj.requires_login && !Alloy.Globals.isLoggedIn) {
				if (ctrlPath != "login") {
					app.navigator.open({
						ctrl : "login",
						titleid : "strSignin",
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
		case "signout":
			uihelper.showDialog({
				message : Alloy.Globals.strings.msgSignout,
				buttonNames : [Alloy.Globals.strings.btnYes, Alloy.Globals.strings.btnNo],
				cancelIndex : 1,
				success : function() {
					http.request({
						method : "patients_logout",
						success : function(result) {
							Alloy.Models.patient.clear();
							Alloy.Collections.menuItems.remove(model);
							app.navigator.open(landingPage);
							uihelper.showDialog({
								message : Alloy.Globals.strings.msgSignedoutSuccessfully
							});
						}
					});
				}
			});
			break;
		default:
			uihelper.showDialog({
				message : Alloy.Globals.strings.msgUnderConstruction
			});
		}
	}
	currentIndex = -1;
}

function didItemClick(e) {
	currentIndex = e.index;
	app.navigator.drawer.toggleLeftWindow();
	if (OS_IOS) {
		didDrawerclose();
	}
}

function terminate() {
	if (OS_ANDROID) {
		app.navigator.drawer.removeEventListener("drawerclose", didDrawerclose);
	}
	$.destroy();
}

exports.init = init;
exports.terminate = terminate;
