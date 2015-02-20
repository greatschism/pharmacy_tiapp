var args = arguments[0] || {},
    app = require("core"),
    dialog = require("dialog"),
    http = require("requestwrapper"),
    iconPrefix = Alloy.CFG.iconPrefix,
    icons = Alloy.CFG.icons,
    startupParams = Alloy.Collections.menuItems.where({
landing_page: true
})[0].toJSON();

Alloy.Collections.menuItems.trigger("reset");
app.navigator.setStartupParams(startupParams);
app.navigator.open(args.navigation || startupParams);

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
	var model = Alloy.Collections.menuItems.at(e.index);
	var itemObj = model.toJSON();
	app.navigator.hamburger.closeLeftMenu(function() {
		if (itemObj.ctrl && itemObj.ctrl != app.navigator.currentRootParams.ctrl) {
			if (itemObj.requires_login && !Alloy.Globals.loggedIn) {
				if (app.navigator.currentRootParams.ctrl != "login") {
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
		} else if (itemObj.action) {
			switch(itemObj.action) {
			case "signout":
				dialog.show({
					message : Alloy.Globals.strings.msgSignout,
					buttonNames : [Alloy.Globals.strings.btnYes, Alloy.Globals.strings.btnNo],
					cancelIndex : 1,
					success : function() {
						http.request({
							method : "logout",
							data : {},
							success : function(result) {
								Alloy.Models.user.set({
									logged_in : false,
									patients : {}
								});
								Alloy.Collections.menuItems.remove(model);
								app.navigator.closeToRoot(function() {
									app.navigator.open(startupParams, function() {
										dialog.show({
											message : Alloy.Globals.strings.msgSignedoutSuccessfully
										});
									});
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
	});
}

function terminate() {
	$.destroy();
}

exports.terminate = terminate;
