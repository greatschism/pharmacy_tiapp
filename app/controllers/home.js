var args = arguments[0] || {},
    iconPrefix = Alloy.CFG.iconPrefix,
    icons = Alloy.CFG.icons;

function init() {
	var items = Alloy.Models.template.get("data");
	_.each(items, function(item) {
		if (_.has(item, "platform") && _.indexOf(item.platform, $.app.device.platform) == -1) {
			return;
		}
		$.contentView.add(create(item));
	});
	if (Alloy.Models.user.get("appload").features.is_banners_enabled && $.bannerView) {
		var banners = Alloy.Models.user.get("banners");
		if (banners) {
			loadBanners(banners);
		} else {
			$.http.request({
				method : "appload_getbanners",
				params : {
					data : [{
						banners : {
							platform : $.app.device.platformCode
						}
					}]
				},
				showLoader : false,
				errorDialogEnabled : false,
				success : didSuccess
			});
		}
	}
}

function didSuccess(result, passthrough) {
	var banners = _.sortBy(result.data.banners.banner, "priority");
	Alloy.Models.user.set("banners", banners);
	loadBanners(banners);
}

function loadBanners(banners) {
	if (_.isArray(banners) && banners.length) {
		$.bannerScrollableView = $.UI.create("ScrollableView", {
			apiName : "ScrollableView",
			height : Alloy.CFG.banner_max_height
		});
		_.each(banners, function(banner) {
			$.bannerScrollableView.addView(Alloy.createController("itemTemplates/banner", banner).getView());
		});
		$.bannerScrollableView.addEventListener("scrollend", didScrollend);
		$.bannerView.add($.bannerScrollableView);
		$.pagingControl = Alloy.createWidget("ti.pagingcontrol", _.extend($.createStyle({
			classes : ["margin-bottom"]
		}), {
			currentPage : 1,
			length : banners.length
		}));
		$.pagingControl.on("change", didChangePager);
		$.bannerView.add($.pagingControl.getView());
	}
}

function didChangePager(e) {
	$.bannerScrollableView.setCurrentPage(e.currentPage);
}

function didScrollend(e) {
	$.pagingControl.setCurrentPage(e.currentPage);
}

function create(dict) {
	var element;
	if (dict.module) {
		element = require(dict.module)[dict.apiName](dict.properties || {});
	} else {
		element = $.UI.create(dict.apiName, {
			apiName : dict.apiName,
			classes : dict.classes || []
		});
	}
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
		_.each(dict.children, function(child) {
			var items = child.items,
			    addChild = child.addChild || "add",
			    asArray = child.asArray,
			    cElemnts = [];
			_.each(items, function(childItem) {
				if (_.has(childItem, "platform") && _.indexOf(childItem.platform, $.app.device.platform) == -1) {
					return;
				}
				if (asArray) {
					cElemnts.push(create(childItem));
				} else {
					element[addChild](create(childItem));
				}
			});
			if (asArray) {
				element[addChild](cElemnts);
			}
		});
	}
	if (_.has(dict, "navigation")) {
		element.navigation = dict.navigation;
		element.addEventListener("click", didItemClick);
	}
	if (_.has(dict, "actions")) {
		_.each(dict.actions, function(action) {
			element.addEventListener(action.event, getListener(action.event));
		});
		element.actions = dict.actions;
	}
	if (_.has(dict, "id")) {
		$[dict.id] = element;
	}
	return element;
}

function getListener(event) {
	switch(event) {
	case "postlayout":
		return didPostlayout;
	}
}

function didItemClick(e) {
	var navigation = e.source.navigation;
	if (!_.isEmpty(navigation) && _.has(navigation, "ctrl")) {
		navigation = Alloy.Collections.menuItems.where(navigation)[0].toJSON();
		if (navigation.requires_login && !Alloy.Globals.loggedIn) {
			$.app.navigator.open({
				ctrl : "login",
				titleid : "strSignin",
				ctrlArguments : {
					navigation : navigation
				}
			});
		} else {
			$.app.navigator.open(navigation);
		}
	}
}

function didClickRightNav(e) {
	$.app.navigator.open({
		ctrl : "login",
		titleid : "strSignin",
	});
}

function didPostlayout(e) {
	var source = e.source,
	    binders = (_.findWhere(source.actions, {
		event : "postlayout"
	}) || {}).binders || [];
	source.removeEventListener("postlayout", didPostlayout);
	_.each(binders, function(binder) {
		var properties = _.pick(source, binder.properties);
		if (_.has(properties, "width")) {
			properties.width = source.rect.width;
		}
		if (_.has(properties, "height")) {
			properties.height = source.rect.height;
		}
		$[binder.id].applyProperties(properties);
	});
}

exports.init = init;
