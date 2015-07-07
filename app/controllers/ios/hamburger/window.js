var args = arguments[0] || {},
    app = require("core"),
    logger = require("logger"),
    controller;

(function() {

	var dict = {},
	    strings = Alloy.Globals.strings;

	if (args.navBarHidden) {
		dict.navBarHidden = true;
	}

	dict.title = args.title || strings[args.titleid || ""] || "";

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

	_.extend(controller, {
		app : app,
		strings : strings,
		logger : require("logger"),
		http : require("requestwrapper"),
		httpclient : require("http"),
		utilities : require("utilities"),
		uihelper : require("uihelper"),
		analytics : require("analytics"),
		apm : require("apm"),
		window : $.window,
		showNavBar : showNavBar,
		hideNavBar : hideNavBar,
		setRightNavButton : setRightNavButton,
	});

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
