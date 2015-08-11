var args = arguments[0] || {},
    navigationHandler = require("navigationHandler"),
    isBannerEnabled = parseInt(Alloy.Models.appload.get("features").is_banners_enabled) || 0,
    icons = Alloy.CFG.icons,
    banners,
    spanTimeId;

function init() {
	var items = Alloy.Models.template.get("data");
	_.each(items, function(item) {
		if (_.has(item, "platform") && _.indexOf(item.platform, $.app.device.platform) == -1) {
			return;
		}
		$.contentView.add(create(item));
	});
	if (isBannerEnabled && $.bannerView && !loadBanners(Alloy.Collections.banners.toJSON())) {
		$.http.request({
			method : "appload_getbanners",
			params : {
				feature_code : "THXXX",
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

function didSuccess(result, passthrough) {
	result = _.sortBy(result.data.banners.banner, "priority");
	Alloy.Collections.banners.reset(result);
	loadBanners(result);
}

function loadBanners(items) {
	if (_.isArray(items) && items.length) {
		banners = items;
		$.bannerScrollableView = Ti.UI.createScrollableView();
		_.each(banners, function(banner) {
			$.bannerScrollableView.addView(Alloy.createController("templates/banner", banner).getView());
		});
		$.bannerScrollableView.addEventListener("scrollend", didScrollend);
		$.pagingControl = Alloy.createWidget("ti.pagingcontrol", _.extend($.createStyle({
			classes : ["margin-bottom"]
		}), {
			currentPage : 0,
			length : banners.length
		}));
		$.pagingControl.on("change", didChangePager);
		if ($.asyncView) {
			$.asyncView.hide([$.bannerScrollableView, $.pagingControl.getView()]);
		} else {
			$.bannerView.add($.bannerScrollableView);
			$.bannerView.add($.pagingControl.getView());
		}
		startSpanTime(banners[0].spanTime);
		return true;
	}
	return false;
}

function startSpanTime(seconds) {
	if (spanTimeId) {
		clearTimeout(spanTimeId);
	}
	spanTimeId = setTimeout(didSpanTimeout, seconds * 1000);
}

function didSpanTimeout() {
	var nextPage = $.bannerScrollableView.currentPage + 1;
	if (banners.length === nextPage) {
		nextPage = 0;
	}
	$.bannerScrollableView.scrollToView(nextPage);
	$.pagingControl.setCurrentPage(nextPage);
	startSpanTime(banners[nextPage].spanTime);
}

function didChangePager(e) {
	var currentPage = e.currentPage;
	$.bannerScrollableView.scrollToView(currentPage);
	startSpanTime(banners[currentPage].spanTime);
}

function didScrollend(e) {
	var currentPage = e.currentPage;
	$.pagingControl.setCurrentPage(currentPage);
	startSpanTime(banners[currentPage].spanTime);
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
	if (dict.apiName === "ImageView") {
		$.uihelper.getImage(dict.image, element);
	}
	if (_.has(dict, "properties")) {
		var properties = dict.properties;
		if (_.has(properties, "icon")) {
			properties.text = icons[properties.icon];
		} else if (_.has(properties, "textid")) {
			properties.text = $.strings[properties.textid];
		} else if (_.has(properties, "titleid")) {
			properties.title = $.strings[properties.titleid];
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
		element.addEventListener("click", didClickItem);
	}
	if (_.has(dict, "actions")) {
		_.each(dict.actions, function(action) {
			element.addEventListener(action.event, getListener(action.event));
		});
		element.actions = dict.actions;
	}
	if (_.has(dict, "id")) {
		$[dict.id] = element;
		if (dict.id == "bannerView" && isBannerEnabled) {
			$.bannerView.applyProperties({
				width : Alloy.CFG.banner_max_width,
				height : Alloy.CFG.banner_max_height
			});
			if (!Alloy.Collections.banners.length) {
				$.asyncView = Alloy.createWidget("ti.asyncview", "widget");
				$.bannerView.add($.asyncView.getView());
			}
		}
	}
	return element;
}

function getListener(event) {
	switch(event) {
	case "postlayout":
		return didPostlayout;
	}
}

function didClickItem(e) {
	var navigation = e.source.navigation || {},
	    menuItem = Alloy.Collections.menuItems.findWhere(navigation);
	navigationHandler.navigate( menuItem ? menuItem.toJSON() : navigation);
}

function didClickRightNav(e) {
	$.app.navigator.open({
		titleid : "titleLogin",
		ctrl : "login"
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

function terminate() {
	if (spanTimeId) {
		clearTimeout(spanTimeId);
	}
}

exports.init = init;
exports.terminate = terminate;
