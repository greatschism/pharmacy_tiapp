var args = arguments[0] || {},
    app = require("core"),
    logger = require("logger"),
    controller;

(function() {

	var dict = {};
	if (args.navBarHidden) {
		dict.navBarHidden = true;
	}

	dict.title = args.title || Alloy.Globals.strings[args.titleid || ""] || "";

	$.leftNavView = Ti.UI.createView();

	if (args.stack) {
		app.navigator.drawer.setOpenDrawerGestureMode("OPEN_MODE_NONE");
		$.leftNavBtn = $.UI.create("Button", {
			apiName : "Button",
			classes : ["nav-icon-btn"],
			title : Alloy.CFG.icons.back,
			accessibilityLabel : Alloy.Globals.strings.accessibilityLblBack
		});
	} else {
		app.navigator.drawer.setOpenDrawerGestureMode("OPEN_MODE_ALL");
		$.leftNavBtn = $.UI.create("Button", {
			apiName : "Button",
			classes : ["nav-icon-btn"],
			title : Alloy.CFG.icons.hamburger,
			accessibilityLabel : Alloy.Globals.strings.accessibilityLblMenu
		});
	}

	$.leftNavView.addEventListener("click", didClickLeftNavView);

	$.leftNavView.add($.leftNavBtn);

	dict.leftNavButton = $.leftNavView;

	//reload tss of this controller in memory
	require("config").updateTSS(args.ctrl);

	controller = Alloy.createController(args.ctrl, args.ctrlArguments || {});

	_.each(controller.getTopLevelViews(), function(child) {
		if (child.__controllerPath) {
			child = child.getView();
		}
		if (!child) {
			return;
		}
		switch(child.role) {
		case "rightNavButton":
			setRightNavButton(child);
			break;
		default:
			$.window.add(child);
		}
	});

	$.window.applyProperties(dict);

	controller.app = app;

	controller.logger = logger;

	controller.http = require("requestwrapper");

	controller.httpclient = require("http");

	controller.utilities = require("utilities");

	controller.uihelper = require("uihelper");

	controller.uihelper = require("analytics");

	controller.apm = require("apm");

	controller.window = $.window;

	controller.setRightNavButton = setRightNavButton;

	controller.showNavBar = showNavBar;

	controller.hideNavBar = hideNavBar;

	_.isFunction(controller.init) && controller.init();

	_.isFunction(controller.setParentViews) && controller.setParentViews($.window);

})();

function didOpen(e) {
	_.isFunction(controller.focus) && controller.focus();
}

function didBlur(e) {
	_.isFunction(controller.blur) && controller.blur();
}

function didClose(e) {
	_.isFunction(controller.terminate) && controller.terminate();
}

function didClickLeftNavView(e) {
	if (args.stack) {
		if (_.isFunction(controller.backButtonHandler) && controller.backButtonHandler()) {
			return;
		}
		app.navigator.close();
	} else {
		app.navigator.drawer.toggleLeftWindow();
	}
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
	$.window.setRightNavButton( view ? view : Ti.UI.createView());
}

exports.ctrlPath = controller ? controller.__controllerPath : "";
