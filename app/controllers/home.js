var args = arguments[0] || {},
    navigationHandler = require("navigationHandler"),
    feedbackHandler = require("feedbackHandler"),
    ctrlShortCode = require("ctrlShortCode"),
    moduleShortCode = require("moduleShortCode"),
    isBannerEnabled = parseInt(Alloy.Models.appload.get("features").is_banners_enabled) || 0,
    apiCodes = Alloy.CFG.apiCodes,
    icons = Alloy.CFG.icons,
    bannerItems = Alloy.Models.banner.get("items"),
    spanTimeId;

function init() {
	var items = Alloy.Models.template.get("data");
	_.each(items, function(item) {
		var view = create(item);
		if (view) {
			$.templateView.add(view);
		}
	});
	/**
	 * when banner feature is enabled and
	 * the current template supports banners
	 * load banners, if nothing in cache call
	 * get banners
	 */
	if (isBannerEnabled && $.bannerView && !loadBanners()) {
		$.http.request({
			method : "appload_get_banners",
			params : {
				data : [{
					banners : {
						platform : Alloy.CFG.platform_code,
					}
				}]
			},
			showLoader : false,
			errorDialogEnabled : false,
			success : didSuccess,
			failure : didSuccess
		});
	}
	/**
	 * check for feedbacks
	 */
	if (feedbackHandler.isEnabled) {
		var feedbackOpt = feedbackHandler.option;
		if (feedbackOpt === apiCodes.feedback_option_remind) {
			showRateDialog();
		} else {
			/**
			 * should be cancel here, only on these two cases counter
			 * feedback is enabled
			 */
			var dialogView = $.UI.create("ScrollView", {
				apiName : "ScrollView",
				classes : ["top", "auto-height", "vgroup"]
			});
			dialogView.add($.UI.create("Label", {
				apiName : "Label",
				classes : ["margin-top-extra-large", "margin-left-extra-large", "margin-right-extra-large", "h3", "txt-center"],
				text : $.strings.homeDialogTitleFeedback
			}));
			dialogView.add($.UI.create("Label", {
				apiName : "Label",
				classes : ["margin-top", "margin-left-extra-large", "margin-right-extra-large"],
				text : $.strings.homeMsgFeedback
			}));
			_.each([{
				title : $.strings.homeDialogBtnGreat,
				classes : ["margin-top-large", "margin-left-extra-large", "margin-right-extra-large", "primary-bg-color", "primary-light-fg-color", "primary-border"]
			}, {
				title : $.strings.homeDialogBtnImprove,
				classes : ["margin-left-extra-large", "margin-right-extra-large", "bg-color", "primary-fg-color", "primary-border"]
			}, {
				title : $.strings.dialogBtnCancel,
				classes : ["margin-bottom-extra-large", "margin-left-extra-large", "margin-right-extra-large", "bg-color", "active-fg-color", "border-color-disabled"]
			}], function(obj, index) {
				var btn = $.UI.create("Button", {
					apiName : "Button",
					classes : obj.classes,
					title : obj.title,
					index : index
				});
				btn.addEventListener("click", didGetFeedback);
				dialogView.add(btn);
			});
			$.feedbackDialog = Alloy.createWidget("ti.modaldialog", "widget", $.createStyle({
				classes : ["modal-dialog"],
				children : [dialogView]
			}));
			$.contentView.add($.feedbackDialog.getView());
			$.feedbackDialog.show();
		}
	}
}

function didGetFeedback(event) {
	var index = event.source.index;
	$.feedbackDialog.hide(function didHide() {
		$.contentView.remove($.feedbackDialog.getView());
		$.feedbackDialog = null;
		switch(index) {
		case 0:
			//great
			sendFeatureEvent("feedbackGreat");
			showRateDialog();
			break;
		case 1:
			//improve
			sendFeatureEvent("feedbackImprove");
			var dialogView = $.UI.create("ScrollView", {
				apiName : "ScrollView",
				classes : ["top", "auto-height", "vgroup"]
			});
			dialogView.add($.UI.create("Label", {
				apiName : "Label",
				classes : ["margin-top-extra-large", "margin-left-extra-large", "margin-right-extra-large", "h3"],
				text : $.strings.homeDialogTitleImprove
			}));
			dialogView.add($.UI.create("Label", {
				apiName : "Label",
				classes : ["margin-top", "margin-left-extra-large", "margin-right-extra-large"],
				text : $.strings.homeMsgImprove
			}));
			$.feedbackTxta = Alloy.createWidget("ti.textarea", "widget", $.createStyle({
				classes : ["margin-left-extra-large", "margin-right-extra-large", "txta", "feedback"],
				hintText : $.strings.homeDialogHintFeedback
			}));
			dialogView.add($.feedbackTxta.getView());
			_.each([{
				title : $.strings.homeDialogBtnSubmit,
				classes : ["margin-left-extra-large", "margin-right-extra-large", "primary-bg-color", "primary-light-fg-color", "primary-border"]
			}, {
				title : $.strings.homeDialogBtnCancel,
				classes : ["margin-bottom-extra-large", "margin-left-extra-large", "margin-right-extra-large", "bg-color", "active-fg-color", "border-color-disabled"]
			}], function(obj, index) {
				var btn = $.UI.create("Button", {
					apiName : "Button",
					classes : obj.classes,
					title : obj.title,
					index : index
				});
				btn.addEventListener("click", didGetComments);
				dialogView.add(btn);
			});
			$.feedbackDialog = Alloy.createWidget("ti.modaldialog", "widget", $.createStyle({
				classes : ["modal-dialog"],
				children : [dialogView]
			}));
			$.contentView.add($.feedbackDialog.getView());
			$.feedbackDialog.show();
			break;
		case 2:
			//cancel
			sendFeatureEvent("feedbackCancel");
			feedbackHandler.option = apiCodes.feedback_option_cancel;
			break;
		}
	});
}

function didGetComments(event) {
	/**
	 * hide keyboard, on android it might stay on window
	 * even after removing text area from window
	 */
	Ti.App.hideKeyboard();
	//identify button and process
	var index = event.source.index;
	switch(index) {
	case 0:
		var feedback = $.feedbackTxta.getValue();
		if (!feedback) {
			$.uihelper.showDialog({
				message : $.strings.homeDialogValFeedback
			});
			return;
		}
		$.http.request({
			method : "appload_feedback",
			params : {
				data : [{
					feedback : {
						feedBackText : feedback,
						feedBackStatus : apiCodes.feedback_option_submitted
					}
				}]
			},
			success : didSubmitFeedback,
			failure : didNotSubmitFeedback
		});
		break;
	case 1:
		sendFeatureEvent("feedbackNotSubmitted");
		feedbackHandler.option = apiCodes.feedback_option_not_submitted;
		break;
	}
	$.feedbackDialog.hide(function didHide() {
		$.contentView.remove($.feedbackDialog.getView());
		$.feedbackDialog = $.commentTxta = null;
	});
}

function showRateDialog() {
	var dialogView = $.UI.create("ScrollView", {
		apiName : "ScrollView",
		classes : ["top", "auto-height", "vgroup"]
	});
	dialogView.add($.UI.create("Label", {
		apiName : "Label",
		classes : ["margin-top-extra-large", "margin-left-extra-large", "margin-right-extra-large", "h3", "txt-center"],
		text : $.strings.homeDialogTitleRate
	}));
	dialogView.add($.UI.create("Label", {
		apiName : "Label",
		classes : ["margin-top", "margin-left-extra-large", "margin-right-extra-large"],
		text : String.format($.strings.homeMsgRate, $.strings["strStore" + Alloy.CFG.platform_code])
	}));
	_.each([{
		title : $.strings.homeDialogBtnRate,
		classes : ["margin-top-large", "margin-left-extra-large", "margin-right-extra-large", "primary-bg-color", "primary-light-fg-color", "primary-border"]
	}, {
		title : $.strings.homeDialogBtnRemind,
		classes : ["margin-left-extra-large", "margin-right-extra-large", "bg-color", "primary-fg-color", "primary-border"]
	}, {
		title : $.strings.homeDialogBtnCancel,
		classes : ["margin-bottom-extra-large", "margin-left-extra-large", "margin-right-extra-large", "bg-color", "active-fg-color", "border-color-disabled"]
	}], function(obj, index) {
		var btn = $.UI.create("Button", {
			apiName : "Button",
			classes : obj.classes,
			title : obj.title,
			index : index
		});
		btn.addEventListener("click", didRateApp);
		dialogView.add(btn);
	});
	$.feedbackDialog = Alloy.createWidget("ti.modaldialog", "widget", $.createStyle({
		classes : ["modal-dialog"],
		children : [dialogView]
	}));
	$.contentView.add($.feedbackDialog.getView());
	$.feedbackDialog.show();
}

function didRateApp(event) {
	var index = event.source.index;
	$.feedbackDialog.hide(function didHide() {
		$.contentView.remove($.feedbackDialog.getView());
		$.feedbackDialog = null;
	});
	switch(index) {
	case 0:
		//rate now
		sendFeatureEvent("feedbackRated");
		feedbackHandler.option = apiCodes.feedback_option_rated;
		var url = Alloy.Models.appload.get("feedback_url");
		if (url) {
			Ti.Platform.openURL(url);
		}
		break;
	case 1:
		//remind later
		sendFeatureEvent("feedbackRemind");
		feedbackHandler.option = apiCodes.feedback_option_remind;
		break;
	case 2:
		//cancel
		sendFeatureEvent("feedbackNotRated");
		feedbackHandler.option = apiCodes.feedback_option_not_rated;
		break;
	}
}

function didSuccess(result, passthrough) {
	//to verify this is not a failure callback
	bannerItems = result.data && _.isArray(result.data.banners.banner) && _.sortBy(result.data.banners.banner, "priority") || [];
	Alloy.Models.banner.set({
		items : bannerItems,
		count : bannerItems.length
	});
	loadBanners();
}

function loadBanners() {
	if (bannerItems) {
		if (bannerItems.length) {
			$.bannerScrollableView = Ti.UI.createScrollableView();
			_.each(bannerItems, function(banner) {
				$.bannerScrollableView.addView(Alloy.createController("templates/banner", banner).getView());
			});
			/**
			 * only when more than one banner placed
			 * paging control should be enabled
			 */
			var len = bannerItems.length,
			    pagingcontrolEnabled = len > 1,
			    views = [$.bannerScrollableView];
			if (pagingcontrolEnabled) {
				$.bannerScrollableView.addEventListener("scrollend", didScrollend);
				$.pagingcontrol = Alloy.createWidget("ti.pagingcontrol", _.extend($.createStyle({
					classes : ["margin-bottom", "pagingcontrol"]
				}), {
					currentPage : 0,
					length : len
				}));
				$.pagingcontrol.on("change", didChangePager);
				views.push($.pagingcontrol.getView());
			}
			if ($.asyncView) {
				$.asyncView.hide(views);
			} else {
				_.each(views, function(view) {
					$.bannerView.add(view);
				});
			}
			if (pagingcontrolEnabled) {
				startSpanTime(bannerItems[0].spanTime);
			}
		} else {
			if ($.asyncView) {
				$.bannerView.remove($.asyncView.getView());
			}
			$.bannerView.applyProperties({
				width : Ti.UI.SIZE,
				height : Ti.UI.SIZE
			});
		}
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
	if (bannerItems.length === nextPage) {
		nextPage = 0;
	}
	$.bannerScrollableView.scrollToView(nextPage);
	$.pagingcontrol.setCurrentPage(nextPage);
	startSpanTime(bannerItems[nextPage].spanTime);
}

function didScrollend(e) {
	var currentPage = e.currentPage;
	$.pagingcontrol.setCurrentPage(currentPage);
	startSpanTime(bannerItems[currentPage].spanTime);
}

function didChangePager(e) {
	//scroll end will be triggered as result of this
	$.bannerScrollableView.scrollToView(e.currentPage);
}

function create(dict) {
	if ((_.has(dict, "feature_name") && !parseInt(Alloy.Models.appload.get("features")[dict.feature_name])) || (_.has(dict, "platform") && _.indexOf(dict.platform, Alloy.CFG.platform) === -1)) {
		return false;
	}
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
		if (_.has(properties, "textid")) {
			properties.text = $.strings[properties.textid];
		} else if (_.has(properties, "titleid")) {
			properties.title = $.strings[properties.titleid];
		}
		element.applyProperties(_.omit(properties, ["textid", "titleid"]));
	}
	if (_.has(dict, "children")) {
		_.each(dict.children, function(child) {
			var items = child.items,
			    addChild = child.addChild || "add",
			    asArray = child.asArray,
			    cElemnts = [];
			_.each(items, function(childItem) {
				if (_.has(childItem, "platform") && _.indexOf(childItem.platform, Alloy.CFG.platform) == -1) {
					return;
				}
				var cElemnt = create(childItem);
				if (cElemnt) {
					if (asArray) {
						cElemnts.push(cElemnt);
					} else {
						element[addChild](cElemnt);
					}
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
		/**
		 * if the tempalte supports banner
		 * and banner feature is enabled,
		 * then apply size bannerView
		 */
		if (dict.id == "bannerView" && isBannerEnabled) {
			/**
			 * when there are banners in cache (length > 0)
			 * or not cached yet
			 */
			if (!bannerItems || (bannerItems && bannerItems.length)) {
				$.bannerView.applyProperties({
					width : Alloy.CFG.banner_width,
					height : Alloy.CFG.banner_height
				});
			}
			/**
			 * when banner is not cached,
			 * then show a async view
			 */
			if (!bannerItems) {
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
	/**
	 * toJSON itself gives a copy of object
	 * so the source object will not be modified
	 * can be used for next event
	 * _.clone(navigation) will give a copy of navigation
	 * to prevent the source object being modified by
	 * navigationHandler
	 */
	navigation = menuItem ? menuItem.toJSON() : _.clone(navigation);
	navigationHandler.navigate(navigation);
	sendFeatureEvent(ctrlShortCode[navigation.ctrl] || navigation.action || navigation.url);
}

function sendFeatureEvent(name) {
	$.analyticsHandler.featureEvent(moduleShortCode[$.ctrlShortCode] + "-" + $.ctrlShortCode + "-" + name);
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

function didSubmitFeedback(result, passthrough) {
	sendFeatureEvent("feedbackSubmitted");
	feedbackHandler.option = apiCodes.feedback_option_submitted;
	$.uihelper.showDialog({
		message : $.strings.homeMsgFeedbackSubmitted
	});
}

function didNotSubmitFeedback(error, passthrough) {
	sendFeatureEvent("feedbackApiFailed-" + error.code);
	feedbackHandler.option = apiCodes.feedback_option_not_submitted;
}

function backButtonHandler() {
	if ($.feedbackDialog) {
		return $.feedbackDialog.getVisible();
	}
	return false;
}

function terminate() {
	if (spanTimeId) {
		clearTimeout(spanTimeId);
	}
}

_.extend($, {
	init : init,
	terminate : terminate,
	backButtonHandler : backButtonHandler
});
