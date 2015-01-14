var args = arguments[0] || {},
    app = require("core"),
    dialog = require("dialog"),
    http = require("requestwrapper"),
    iconSet = Alloy.CFG.iconSet,
    icons = Alloy.CFG.icons,
    homePageParams = Alloy.Collections.menuItems.where({
landingPage: true
})[0].toJSON();

Alloy.Collections.menuItems.trigger("reset");
app.navigator.open(homePageParams);

function transformFunction(model) {
	var transform = model.toJSON();
	transform.icon = icons[iconSet + "_" + transform.icon] || icons[transform.icon];
	transform.title = Alloy.Globals.strings[transform.titleid];
	return transform;
}

function didItemClick(e) {
	var model = Alloy.Collections.menuItems.at(e.index);
	var itemObj = model.toJSON();
	app.navigator.hamburger.closeLeftMenu(function() {
		if (itemObj.ctrl && itemObj.ctrl != app.navigator.currentParams.ctrl) {
			if (itemObj.requiresLogin == true && Alloy.Models.user.get("loggedIn") == false) {
				if (app.navigator.currentParams.ctrl != "login") {
					app.navigator.open({
						ctrl : "login",
						titleid : "strLogin",
						ctrlArguments : {
							navigateTo : itemObj
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
							data : {
								request : {
									logout : {
										featurecode : "TH0XX"
									}
								}
							},
							success : function(result) {
								Alloy.Models.user.set({
									loggedIn : false,
									sessionId : ""
								});
								Alloy.Collections.menuItems.remove(model);
								app.navigator.closeToHome(function() {
									app.navigator.open(homePageParams, function() {
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
