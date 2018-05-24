var args = $.args,
    TAG = "DRVC",
    app = require("core"),
    ctrlShortCode = require("ctrlShortCode"),
    analyticsHandler = require("analyticsHandler"),
    logger = require("logger"),
    controller;

function init() {

	var strings = Alloy.Globals.strings;

	$.window = app.navigator.rootWindow;

	setTitle(args.title || strings[args.titleid || ""] || "");

	if (args.navBarHidden) {
		hideNavBar();
	} else if (app.navigator.rootNavBarHidden) {
		showNavBar();
	}

	/**
	 *  let the new controller know where it is coming from
	 *  through the origin parameter
	 */
	var hasRightNavButton = false,
	    ctrlArguments = args.ctrlArguments || {};
	ctrlArguments.origin = (app.navigator.controllers[app.navigator.controllers.length - 1] || {}).ctrlPath;
	controller = Alloy.createController(args.ctrl, ctrlArguments);

	_.each(controller.getTopLevelViews(), function(child) {
		if (child.__iamalloy) {
			child = child.getView();
		}
		if (!child) {
			return;
		}
		switch(child.role) {
		case "ignore":
			//just ignore
			break;
		case "rightNavButton":
			hasRightNavButton = true;
			setRightNavButton(child);
			break;
		case "contentView":
			$.contentView = child;
			break;
		default:
			if (!$.contentView) {
				$.contentView = $.UI.create("View", {
					classes : ["bg-color"]
				});
			}
			$.contentView.add(child);
		}
	});

	$.contentView.addEventListener("click", handleEvent);
	$.contentView.addEventListener("change", handleEvent);

	$.addTopLevelView($.contentView);

	if (!hasRightNavButton) {
		setRightNavButton();
	}

	_.extend(controller, {
		app : app,
		strings : strings,
		logger : logger,
		http : require("requestwrapper"),
		httpClient : require("http"),
		utilities : require("utilities"),
		uihelper : require("uihelper"),
		analyticsHandler : analyticsHandler,
		// crashreporter : require("crashreporter"),
		contentView : $.contentView,
		window : $.window,
		setTitle : setTitle,
		showNavBar : showNavBar,
		hideNavBar : hideNavBar,
		setRightNavButton : setRightNavButton,
		ctrlShortCode : $.ctrlShortCode
	});

	logger.debug(TAG, "init", $.ctrlShortCode);

	controller.init && controller.init();

	controller.setParentView && controller.setParentView($.contentView);

	if (Ti.App.accessibilityEnabled)
		Ti.App.addEventListener("keyboardframechanged", scrollOnKeyboardEvent);
}

function scrollOnKeyboardEvent(e) {
	var scroller = controller.getTopLevelViews()[0];
	scroller.height = parseInt(scroller.rect.height) + "dp";
	scroller.scrollToBottom();
}

function requestTitleControlFocus() {
	controller.uihelper.requestViewFocus($.window.titleControl);
}

function focus(e) {
	logger.debug(TAG, "focus", $.ctrlShortCode);
	requestTitleControlFocus();
	controller.focus && controller.focus();
}

function blur(e) {
	logger.debug(TAG, "blur", $.ctrlShortCode);
	controller.blur && controller.blur();
}

function terminate(e) {
	logger.debug(TAG, "terminate", $.ctrlShortCode);
	controller.terminate && controller.terminate();
	if (Ti.App.accessibilityEnabled)
		Ti.App.removeEventListener("keyboardframechanged", scrollOnKeyboardEvent);
}

function setTitle(title) {
    if(title == "Home" && (Alloy.CFG.homescreen_template_banner_below === "homescreenTemplateBannerBelow")) {
   		$.window.titleControl.text = "";
	} else {
		$.window.titleControl.text = title;
	}
}

function showNavBar(animated) {
	$.window.showNavBar({
		animated : _.isUndefined(animated) ? true : false
	});
	app.navigator.rootNavBarHidden = false;
}

function hideNavBar(animated) {
	$.window.hideNavBar({
		animated : _.isUndefined(animated) ? true : false
	});
	app.navigator.rootNavBarHidden = true;
}

function setRightNavButton(view) {
	if (view) {
		view.addEventListener("click", handleEvent);
	} else {
		view = Ti.UI.createView();
	}
	$.window.setRightNavButton(view);
}

function handleEvent(e) {
	analyticsHandler.handleEvent($.ctrlShortCode, e);
}

_.extend($, {
	init : init,
	blur : blur,
	focus : focus,
	terminate : terminate,
	ctrlPath : args.ctrl,
	requestTitleControlFocus : requestTitleControlFocus,
	ctrlShortCode : ctrlShortCode[args.ctrl]
});
