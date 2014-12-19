var args = arguments[0] || {},
    iconSet = Alloy.CFG.iconSet,
    icons = Alloy.CFG.icons,
    app = require("core");

function init() {
	Alloy.Collections.homePageItems.trigger("reset");
	Alloy.Models.user.on("change", didChangeUser);
	Alloy.Models.user.trigger("change");
}

function didChangeUser() {
	$.signinBtn.visible = !Alloy.Models.user.get("loggedIn");
}

function didItemClick(e) {
	var navigation = Alloy.Collections.homePageItems.at(e.index).toJSON();
	if (!_.isEmpty(navigation)) {
		if (navigation.requiresLogin == true && Alloy.Models.user.get("loggedIn") == false) {
			app.navigator.open({
				ctrl : "login",
				titleid : "strLogin",
				ctrlArguments : {
					navigateTo : navigation
				}
			});
		} else {
			app.navigator.open(navigation);
		}
	}
}

function transformData(model) {
	var transform = model.toJSON();
	transform.title = Alloy.Globals.strings[transform.titleid];
	transform.icon = icons[iconSet + "_" + transform.icon] || icons[transform.icon];
	return transform;
}

function didClickSignin(e) {
	app.navigator.open({
		ctrl : "login",
		titleid : "strLogin",
	});
}

function terminate() {
	Alloy.Models.user.off("change", didChangeUser);
	$.destroy();
}

exports.init = init;
exports.terminate = terminate;
