var args = arguments[0] || {},
    app = require("core"),
    dialog = require("dialog"),
    http = require("requestwrapper"),
    iconPrefix = Alloy.CFG.iconPrefix,
    icons = Alloy.CFG.icons,
    currentIndex = -1,
    landingPage;

function init(_navigation) {
	if (OS_ANDROID) {
		app.navigator.drawer.addEventListener("windowDidClose", didLeftWindowClose);
	}
	landingPage = _.findWhere(Alloy.Collections.menuItems.toJSON(), {
		landing_page : true
	});
	Alloy.Collections.menuItems.trigger("reset");
	app.navigator.open(_navigation || landingPage);
}

function didLeftWindowClose(e) {
	if (currentIndex == -1) {
		return false;
	}
	var model = Alloy.Collections.menuItems.at(currentIndex),
	    itemObj = model.toJSON();
	if (itemObj.ctrl) {
		var ctrlPath = app.navigator.currentController.ctrlPath;
		if (itemObj.ctrl != ctrlPath) {
			if (itemObj.requires_login && !Alloy.Globals.loggedIn) {
				if (ctrlPath != "login") {
					app.navigator.open({
						ctrl : "login",
						titleid : "strLogin",
						ctrlArguments : {
							navigation : itemObj
						}
					});
				}
			} else {
				app.navigator.open(itemObj);
			}
		}
	} else if (itemObj.action) {
		switch(itemObj.action) {
		case "signout":
			dialog.show({
				message : Alloy.Globals.strings.msgSignout,
				buttonNames : [Alloy.Globals.strings.btnYes, Alloy.Globals.strings.btnNo],
				cancelIndex : 1,
				success : function() {
					http.request({
						method : "PATIENTS_LOGOUT",
						success : function(_result) {
							Alloy.Models.user.set({
								logged_in : false,
								patients : {}
							});
							Alloy.Collections.menuItems.remove(model);
							app.navigator.open(landingPage);
							dialog.show({
								message : Alloy.Globals.strings.msgSignedoutSuccessfully
							});
						}
					});
				}
			});
			break;
		default:
			dialog.show({
				message : Alloy.Globals.strings.msgUnderConstruction
			});
		}
	}
	currentIndex = -1;
}

function filterFunction(collection) {
	$.menu.backgroundColor = Alloy.TSS.primary_bg_color.backgroundColor;
	return collection.models;
}

function transformFunction(model) {
	var transform = model.toJSON();
	transform.icon = icons[iconPrefix + "_" + transform.icon] || icons[transform.icon];
	transform.title = Alloy.Globals.strings[transform.titleid];
	return transform;
}

function didItemClick(e) {
	currentIndex = e.index;
	if (!OS_ANDROID) {
		didLeftWindowClose();
	}
	app.navigator.drawer.toggleLeftWindow();
}

function terminate() {
	if (OS_ANDROID) {
		app.navigator.drawer.removeEventListener("windowDidClose", didLeftWindowClose);
	}
	$.destroy();
}

exports.init = init;
exports.terminate = terminate;
