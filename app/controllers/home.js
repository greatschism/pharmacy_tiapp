var args = arguments[0] || {},
    iconSet = Alloy.CFG.iconSet,
    icons = Alloy.CFG.icons,
    app = require("core");

function init() {
	var homePageTemplate = Alloy.Globals.homePageTemplates[Alloy.Globals.templateIndex].data;
	for (var i in homePageTemplate) {
		$.containerView.add(create(homePageTemplate[i]));
	}
	Alloy.Models.user.on("change", didChangeUser);
	Alloy.Models.user.trigger("change");
}

function create(dict) {
	var element = $.UI.create(dict.apiName, {
		apiName : dict.apiName,
		classes : dict.classes || []
	});
	if (_.has(dict, "properties")) {
		var properties = dict.properties;
		if (_.has(properties, "icon")) {
			properties.text = icons[iconSet + "_" + properties.icon] || icons[properties.icon];
		} else if (_.has(properties, "textid")) {
			properties.text = Alloy.Globals.strings[properties.textid];
		} else if (_.has(properties, "titleid")) {
			properties.title = Alloy.Globals.strings[properties.titleid];
		}
		element.applyProperties(_.omit(properties, ["textid", "titleid", "icon"]));
	}
	if (_.has(dict, "children")) {
		var children = dict.children,
		    asArray = dict.asArray,
		    cElemnts = [];
		for (var i in children) {
			var child = children[i];
			if (asArray) {
				cElemnts.push(create(child));
			} else {
				element[dict.addChild || "add"](create(child));
			}
		}
		if (asArray) {
			element[dict.addChild](cElemnts);
		}
	}
	if (_.has(dict, "navigation")) {
		element.navigation = dict.navigation;
		element.addEventListener("click", didItemClick);
	}
	return element;
}

function didChangeUser() {
	$.signinBtn.visible = !Alloy.Models.user.get("loggedIn");
}

function didItemClick(e) {
	var navigation = Alloy.Collections.menuItems.where(e.source.navigation)[0].toJSON();
	if (!_.isEmpty(navigation) && _.has(navigation, "ctrl")) {
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

function didClickSignin(e) {
	app.navigator.open({
		ctrl : "login",
		titleid : "strLogin",
	});
}

function terminate() {
	Alloy.Models.user.off("change", didChangeUser);
}

exports.init = init;
exports.terminate = terminate;
