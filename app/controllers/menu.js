var args = arguments[0] || {},
    app = require("core");

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
	var mdoel = Alloy.Collections.menuItems.at( OS_MOBILEWEB ? e.index : e.itemIndex);
	var itemObj = mdoel.toJSON();
	app.navigator.hamburger.closeLeftMenu(function() {
		if (itemObj.ctrl && itemObj.ctrl != app.navigator.currentParams.ctrl) {
			app.navigator.open(itemObj);
		} else if (itemObj.action) {
			switch(itemObj.action) {
			case "signout":
				Alloy.Globals.userInfo = {};
				mdoel.set({
					titleid : "strSignin",
					action : "signin"
				});
				break;
			case "signin":
				app.navigator.open({
					ctrl : "login"
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
