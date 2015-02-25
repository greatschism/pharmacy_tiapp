var args = arguments[0] || {},
    app = require("core"),
    iconPrefix = Alloy.CFG.iconPrefix,
    icons = Alloy.CFG.icons;

function init() {
	var homePageTemplate = Alloy.Models.template.get("data");
	for (var i in homePageTemplate) {
		$.containerView.add(create(homePageTemplate[i]));
	}
	Alloy.Models.user.on("change", didChangeAuthorization);
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
			properties.text = icons[iconPrefix + "_" + properties.icon] || icons[properties.icon];
		} else if (_.has(properties, "textid")) {
			properties.text = Alloy.Globals.strings[properties.textid];
		} else if (_.has(properties, "titleid")) {
			properties.title = Alloy.Globals.strings[properties.titleid];
		}
		element.applyProperties(_.omit(properties, ["textid", "titleid", "icon"]));
	}
	if (_.has(dict, "children")) {
		var children = dict.children;
		for (var i in children) {
			var items = children[i].items,
			    addChild = children[i].addChild || "add",
			    asArray = children[i].asArray,
			    cElemnts = [];
			for (var i in items) {
				var childItem = items[i];
				if (asArray) {
					cElemnts.push(create(childItem));
				} else {
					element[addChild](create(childItem));
				}
			}
			if (asArray) {
				element[addChild](cElemnts);
			}
		}
	}
	if (_.has(dict, "navigation")) {
		element.navigation = dict.navigation;
		element.addEventListener("click", didItemClick);
	}
	return element;
}

function didChangeAuthorization() {
	$.signinView.visible = !Alloy.Models.user.get("logged_in");
}

function didItemClick(e) {
	var navigation = e.source.navigation;
	if (!_.isEmpty(navigation) && _.has(navigation, "ctrl")) {
		navigation = Alloy.Collections.menuItems.where(navigation)[0].toJSON();
		if (navigation.requires_login && !Alloy.Globals.loggedIn) {
			app.navigator.open({
				ctrl : "login",
				titleid : "strLogin",
				ctrlArguments : {
					navigation : navigation
				}
			});
		} else {
			app.navigator.open(navigation);
		}
	}
}

function didTapSignin(e) {
	app.navigator.open({
		ctrl : "login",
		titleid : "strLogin",
	});
}

function terminate() {
	Alloy.Models.user.off("change", didChangeAuthorization);
}

exports.init = init;
exports.terminate = terminate;
