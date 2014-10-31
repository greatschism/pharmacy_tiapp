var args = arguments[0] || {},
    app = require("core"),
    dialog = require("dialog"),
    http = require("httpwrapper");

Alloy.Collections.menuItems.reset(Alloy.CFG.menuItems);
app.navigator.open(Alloy.Collections.menuItems.where({
landingPage: true
})[0].toJSON());

function transformFunction(model) {
	var transform = model.toJSON();
	transform.title = Alloy.Globals.Strings[transform.titleid];
	return transform;
}

function didItemClick(e) {
	var model = Alloy.Collections.menuItems.at( OS_MOBILEWEB ? e.index : e.itemIndex);
	var itemObj = model.toJSON();
	app.navigator.hamburger.closeLeftMenu(function() {
		if (itemObj.ctrl && itemObj.ctrl != app.navigator.currentParams.ctrl) {
			app.navigator.open(itemObj);
		} else if (itemObj.action) {
			switch(itemObj.action) {
			case "signout":
				dialog.show({
					message: Alloy.Globals.Strings.msgSignout,
					buttonNames: [Alloy.Globals.Strings.btnYes, Alloy.Globals.Strings.btnNo],
					cancelIndex: 1,
					success: function(){
						http.request({
							method : "logout",
							data : {
								request:{
									logout:{
										featurecode : Alloy.CFG.featurecode
									}
								}
							},
							success : function(result){
								Alloy.Models.user.set({
									loggedIn: false,
									sessionId: ""
								});
								Alloy.Collections.menuItems.remove(model);
								app.navigator.closeToHome(function(){
									dialog.show({
										message: Alloy.Globals.Strings.msgSignedoutSuccessfully
									});
								});
							}
						});
					}
				});
				break;
			}
		}
	});
}

function terminate() {
	$.destroy();
}

exports.terminate = terminate;
