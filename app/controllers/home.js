var args = $.args,
    navigationHandler = require("navigationHandler"),
    feedbackHandler = require("feedbackHandler"),
    moduleNames = require("moduleNames"),
    ctrlNames = require("ctrlNames"),
    apiCodes = Alloy.CFG.apiCodes,
    icons = Alloy.CFG.icons,
    bannerItems = Alloy.Models.banner.get("items"),
    spanTimeId,
    logger = require("logger");
;

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
	if (Alloy.CFG.is_banners_enabled && $.bannerView && !loadBanners()) {
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
				classes : ["margin-top-large", "margin-left-extra-large", "margin-right-extra-large", "primary-bg-color", "primary-font-color", "primary-border"]
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
				$.addListener(btn, "click", didGetFeedback);
				dialogView.add(btn);
			});
			if (OS_ANDROID) {
				$.feedbackDialog = Ti.UI.createAlertDialog({
			    	androidView : dialogView
			  	});
			} else{
				$.feedbackDialog = Alloy.createWidget("ti.modaldialog", "widget", $.createStyle({
					classes : ["modal-dialog"],
					children : [dialogView]
				}));
				$.contentView.add($.feedbackDialog.getView());
			}
			$.feedbackDialog.show();
		}
	}
}

function didGetFeedback(event) {
	var index = event.source.index;
	$.feedbackDialog.hide();
	didFeedbackHide(index);
}

function didFeedbackHide(index) {
	if (OS_IOS) {
		$.contentView.remove($.feedbackDialog.getView());
		$.feedbackDialog = null;
	};
	switch(index) {
	case 0:
		//great
		trackEvent("click", "FeedbackGreat");
		showRateDialog();
		break;
	case 1:
		//improve
		trackEvent("click", "FeedbackImprove");
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
			classes : ["margin-left-extra-large", "margin-right-extra-large", "primary-bg-color", "primary-font-color", "primary-border"]
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
			$.addListener(btn, "click", didGetComments);
			dialogView.add(btn);
		});
		if (OS_ANDROID) {
			$.feedbackDialog = Ti.UI.createAlertDialog({
		    	androidView : dialogView
		  	});
		} else{
			$.feedbackDialog = Alloy.createWidget("ti.modaldialog", "widget", $.createStyle({
				classes : ["modal-dialog"],
				children : [dialogView]
			}));
			$.contentView.add($.feedbackDialog.getView());
		}
		$.feedbackDialog.show();
		break;
	case 2:
		//cancel
		trackEvent("click", "FeedbackCancel");
		feedbackHandler.option = apiCodes.feedback_option_cancel;
		break;
	}
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
		trackEvent("click", "FeedbackNotSubmitted");
		feedbackHandler.option = apiCodes.feedback_option_not_submitted;
		break;
	}
	$.feedbackDialog.hide();
	if (OS_IOS) {
		$.contentView.remove($.feedbackDialog.getView());
		$.feedbackDialog = $.commentTxta = null;
	}
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
		classes : ["margin-top-large", "margin-left-extra-large", "margin-right-extra-large", "primary-bg-color", "primary-font-color", "primary-border"]
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
		$.addListener(btn, "click", didRateApp);
		dialogView.add(btn);
	});
	if (OS_ANDROID) {
		$.feedbackDialog = Ti.UI.createAlertDialog({
	    	androidView : dialogView
	  	});
	} else{
		$.feedbackDialog = Alloy.createWidget("ti.modaldialog", "widget", $.createStyle({
			classes : ["modal-dialog"],
			children : [dialogView]
		}));
		$.contentView.add($.feedbackDialog.getView());	
	};
	$.feedbackDialog.show();
}

function didRateApp(event) {
	var index = event.source.index;
	$.feedbackDialog.hide();
	if (OS_IOS) {
		$.contentView.remove($.feedbackDialog.getView());
		$.feedbackDialog = null;
	}
	switch(index) {
	case 0:
		//rate now
		trackEvent("click", "FeedbackRated");
		feedbackHandler.option = apiCodes.feedback_option_rated;
		var url = Alloy.Models.appload.get("feedback_url");
		if (url) {
			Ti.Platform.openURL(url);
		}
		break;
	case 1:
		//remind later
		trackEvent("click", "FeedbackRemind");
		feedbackHandler.option = apiCodes.feedback_option_remind;
		break;
	case 2:
		//cancel
		trackEvent("click", "FeedbackNotRated");
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
			$.bannerScrollableView.accessibilityHidden = false;
			$.bannerScrollableView.accessibilityLabel = bannerItems[0].description;
			if (OS_ANDROID) {
				$.bannerView.accessibilityLabel = bannerItems[0].description;
			};
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
				$.addListener($.bannerScrollableView, "scrollend", didScrollend);
				$.pagingcontrol = Alloy.createWidget("ti.pagingcontrol", _.extend($.createStyle({
					classes : ["margin-bottom", "pagingcontrol", "accessibility-enabled"]
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

    	if (Alloy.CFG.homescreen_template_banner_below === "homescreenTemplateBannerBelow") {		
			Alloy.Globals.homeBannerHeight = $.bannerView.rect.height || Alloy.Globals.homeBannerHeight;
			$.scrollView.applyProperties({
				showVerticalScrollIndicator : true,
				top : 0,
				bottom : Alloy.Globals.homeBannerHeight
			});
		}

		if ($.pagingcontrol) {
			$.pagingcontrol.accessibilityLabel = "Paging control";
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
	$.bannerScrollableView.accessibilityLabel = bannerItems[nextPage].description;
	if (OS_ANDROID) {
		$.bannerView.accessibilityLabel = bannerItems[nextPage].description;
	};
	$.pagingcontrol.setCurrentPage(nextPage);
	startSpanTime(bannerItems[nextPage].spanTime);
}

function didScrollend(e) {
	var currentPage = e.currentPage;
	$.pagingcontrol.setCurrentPage(currentPage);
	startSpanTime(bannerItems[currentPage].spanTime);
	$.pagingcontrol.accessibilityLabel = "Page " + currentPage;

}

function didChangePager(e) {
	//scroll end will be triggered as result of this
	$.bannerScrollableView.scrollToView(e.currentPage);
}

function create(dict) {
	if ((_.has(dict, "feature_name") && !Alloy.CFG[dict.feature_name]) || (_.has(dict, "platform") && _.indexOf(dict.platform, Alloy.CFG.platform) === -1)) {
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
			properties.accessibilityLabel = $.strings[properties.textid];
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
		$.addListener(element, "click", didClickItem);
		element.navigation = dict.navigation;
	}
	if (_.has(dict, "actions")) {
		_.each(dict.actions, function(action) {
			$.addListener(element, action.event, getListener(action.event));
		});
		element.actions = dict.actions;
	}
	if (_.has(dict, "id")) {
		$[dict.id] = element;
		/**
		 * if the template supports banner
		 * and banner feature is enabled,
		 * then apply size bannerView
		 */
		if (dict.id == "bannerView" && Alloy.CFG.is_banners_enabled) {
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
	switch(element.apiName) {
	case "View":
		element.wrapViews && $.uihelper.wrapViews(element, element.direction);
		break;
	case "Label":
		element.ellipsize && $.uihelper.wrapText(element);
		break;
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
	trackEvent("navigate", ctrlNames[navigation.ctrl] || navigation.action || navigation.url);
}

function trackEvent(action, label) {
	$.analyticsHandler.trackEvent(moduleNames[$.ctrlShortCode] + "-" + ctrlNames[$.ctrlShortCode], action, label);
}

function didClickRightNav(e) {
	$.app.navigator.open({
		titleid : "titleLogin",
		ctrl : "login"
	});
}

function didClickRightNavLoggedIn(e) {
	$.optionsMenu.show();
}

function didPostlayout(e) {
	logger.debug("\n\n\n home didPostLayout\n\n\n");

	if (Alloy.Globals.isLoggedIn) {
		$.rightNavBtn.getNavButton().accessibilityLabel = Alloy.Globals.strings.iconAccessibilityLblAccount;
	}

	var source = e.source,
	    action = _.findWhere(source.actions, {
		event : "postlayout"
	}) || {},
	    binders = action.binders || [];
	if (!action.keepAlive) {
		$.removeListener(source, "postlayout", didPostlayout);
	}
	_.each(binders, function(binder) {
		/**
		 * pick - pick properties from source and apply
		 * to binded object
		 * transform - pick properties from source
		 * as apply to binded object as destination
		 * properties - additional properties to be
		 * applied to binded object
		 */
		var properties = _.pick(source, binder.pick);
		_.extend(properties, binder.properties);
		if (_.has(properties, "width")) {
			properties.width = source.rect.width;
		}
		if (_.has(properties, "height")) {
			properties.height = source.rect.height;
		}
		_.each(binder.transform, function(transformer) {
			properties[transformer.to] = transformer.from === "width" || transformer.from === "height" ? source.rect[transformer.from] : source[transformer.from];
		});
		$[binder.id].applyProperties(properties);
	});
}

function didClickOptionMenu(e) {
	/**
	 * cancel index may vary,
	 * based on arguments, so check
	 * the cancel flag before proceed
	 */
	if (e.cancel) {
		return false;
	}
	switch(e.index) {
	case 0:
		$.app.navigator.open({
			titleid : "titleAccount",
			ctrl : "account"
		});
		break;
	case 1:
		$.uihelper.showDialog({
			message : Alloy.Globals.strings.msgLogoutConfirm,
			buttonNames : [Alloy.Globals.strings.dialogBtnYes, Alloy.Globals.strings.dialogBtnNo],
			cancelIndex : 1,
			success : logout
		});
		break;
	default:
		break;
	}
}

function logout() {
	require("authenticator").logout({
		dialogEnabled : true
	});
}

function didSubmitFeedback(result, passthrough) {
	trackEvent("click", "FeedbackSubmitted");
	feedbackHandler.option = apiCodes.feedback_option_submitted;
	$.uihelper.showDialog({
		message : $.strings.homeMsgFeedbackSubmitted
	});
}

function didNotSubmitFeedback(error, passthrough) {
	trackEvent("api", "FeedbackApiFailedWithCode" + error.code);
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
	$.removeListener();
}

_.extend($, {
	init : init,
	terminate : terminate,
	backButtonHandler : backButtonHandler
});
