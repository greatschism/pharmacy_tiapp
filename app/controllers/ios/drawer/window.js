var args = arguments[0] || {},
    TAG = "DRWC",
    app = require("core"),
    analytics = require("analytics"),
    ctrlShortCode = require("ctrlShortCode"),
    logger = require("logger"),
    controller;

function init() {

	var strings = Alloy.Globals.strings;

	setTitle(args.title || strings[args.titleid || ""] || "");

	/**
	 *  let the new controller know where it is coming from
	 *  through the origin parameter
	 */
	var ctrlArguments = args.ctrlArguments || {};
	ctrlArguments.origin = app.navigator.currentController.ctrlPath;
	controller = Alloy.createController(args.ctrl, ctrlArguments);

	_.extend($, {
		ctrlPath : args.ctrl,
		shortCode : ctrlShortCode[args.ctrl]
	});

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
			setRightNavButton(child);
			break;
		default:
			$.window.add(child);
		}
	});

	_.extend(controller, {
		app : app,
		strings : strings,
		logger : logger,
		http : require("requestwrapper"),
		httpClient : require("http"),
		utilities : require("utilities"),
		uihelper : require("uihelper"),
		analytics : analytics,
		crashreporter : require("crashreporter"),
		window : $.window,
		setTitle : setTitle,
		showNavBar : showNavBar,
		hideNavBar : hideNavBar,
		setRightNavButton : setRightNavButton
	});

	logger.debug(TAG, "init", $.shortCode);

	controller.init && controller.init();

	controller.setParentView && controller.setParentView($.window);
}

function focus(e) {
	logger.debug(TAG, "focus", $.shortCode);
	controller.focus && controller.focus();
}

function blur(e) {
	logger.debug(TAG, "blur", $.shortCode);
	controller.blur && controller.blur();
}

function terminate(e) {
	logger.debug(TAG, "terminate", $.shortCode);
	controller.terminate && controller.terminate();
}

function didClickLeftNavView(e) {
	if (!controller.backButtonHandler || !controller.backButtonHandler()) {
		app.navigator.close();
	}
}

function setTitle(title) {
	$.window.title = title;
}

function showNavBar(animated) {
	$.window.showNavBar({
		animated : _.isUndefined(animated) ? true : false
	});
}

function hideNavBar(animated) {
	$.window.hideNavBar({
		animated : _.isUndefined(animated) ? true : false
	});
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
	analytics.handleEvent(e);
}

_.extend($, {
	init : init,
	blur : blur,
	focus : focus
});
