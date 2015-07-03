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

	$.leftNavView.add($.UI.create("Button", {
		classes : ["nav-icon", (args.stack ? "icon-back" : "icon-hamburger")]
	}));

	$.leftNavView.addEventListener("click", didClickLeftNavView);

	dict.leftNavButton = $.leftNavView;

	//reload tss of this controller in memory
	require("config").updateTSS(args.ctrl);

	controller = Alloy.createController(args.ctrl, args.ctrlArguments || {});

	_.each(controller.getTopLevelViews(), function(child) {
		if (child.__iamalloy) {
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

	controller.analytics = require("analytics");

	controller.apm = require("apm");

	controller.window = $.window;

	controller.setRightNavButton = setRightNavButton;

	controller.showNavBar = showNavBar;

	controller.hideNavBar = hideNavBar;

	controller.init && controller.init();

	controller.setParentViews && controller.setParentViews($.window);

})();

function didOpen(e) {
	controller.focus && controller.focus();
}

function didBlur(e) {
	controller.blur && controller.blur();
}

function didClose(e) {
	controller.terminate && controller.terminate();
}

function didClickLeftNavView(e) {
	if (args.stack) {
		if (controller.backButtonHandler && controller.backButtonHandler()) {
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

exports.ctrlPath = controller.__controllerPath;
