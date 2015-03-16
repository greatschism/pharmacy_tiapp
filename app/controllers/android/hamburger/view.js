var args = arguments[0] || {},
    app = require("core"),
    abextras = require("com.alcoapps.actionbarextras"),
    controller;

(function() {

	$.window = app.navigator.rootWindow;

	abextras.setTitle(args.title || Alloy.Globals.strings[args.titleid || ""] || "");

	var dict = {};
	if (args.navBarHidden) {
		dict.navBarHidden = true;
	}

	$.leftNavView = Ti.UI.createView();

	if (args.stack) {
		app.navigator.drawer.setOpenDrawerGestureMode(app.navigator.drawer.OPEN_MODE_NONE);
		$.leftNavBtn = $.UI.create("Button", {
			classes : ["nav-icon-btn"],
			title : Alloy.CFG.icons.back,
			accessibilityLabel : Alloy.Globals.strings.accessibilityLblBack
		});
	} else {
		app.navigator.drawer.setOpenDrawerGestureMode(app.navigator.drawer.OPEN_MODE_MARGIN);
		$.leftNavBtn = $.UI.create("Button", {
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
			dict.rightNavButton = child;
			break;
		default:
			$.containerView.add(child);
		}
	});

	//$.window.applyProperties(dict);

	controller.app = app;

	controller.window = $.window;

	controller.setRightNavButton = setRightNavButton;

	controller.showNavBar = showNavBar;

	controller.hideNavBar = hideNavBar;

	_.isFunction(controller.init) && controller.init();

	_.isFunction(controller.setParentViews) && controller.setParentViews($.containerView);

})();

function focus(e) {
	_.isFunction(controller.focus) && controller.focus();
}

function blur(e) {
	_.isFunction(controller.blur) && controller.blur();
}

function terminate(e) {
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

function showNavBar(_animated) {
	$.window.showNavBar({
		animated : _.isUndefined(_animated) ? true : false
	});
}

function hideNavBar(_animated) {
	$.window.hideNavBar({
		animated : _.isUndefined(_animated) ? true : false
	});
}

function setRightNavButton(_view) {
	$.window.setRightNavButton(_view);
}

exports.blur = blur;
exports.focus = focus;
exports.terminate = terminate;
exports.ctrlPath = controller ? controller.__controllerPath : "";
