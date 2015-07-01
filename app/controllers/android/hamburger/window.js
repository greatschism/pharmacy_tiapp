var args = arguments[0] || {},
    app = require("core"),
    controller,
    rightNavItem;

(function() {

	$.window.title = args.title || Alloy.Globals.strings[args.titleid || ""] || "";

	//reload tss of this controller in memory
	require("config").updateTSS(args.ctrl);

	controller = Alloy.createController(args.ctrl, args.ctrlArguments || {});

	_.each(controller.getTopLevelViews(), function(child) {
		var role = child.role;
		if (child.__iamalloy) {
			child = child.getView();
		}
		if (!child) {
			return;
		}
		if (!role) {
			role = child.role;
		}
		switch(role) {
		case "rightNavButton":
			rightNavItem = child;
			break;
		default:
			$.window.add(child);
		}
	});

	controller.app = app;

	controller.logger = require("logger");

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

	$.actionBar = $.window.getActivity().actionBar;

	if (rightNavItem) {
		setRightNavButton(rightNavItem);
	}

	if (args.navBarHidden) {
		hideNavBar();
	}

	focus();
}

function focus(e) {
	controller.focus && controller.focus();
}

function blur(e) {
	controller.blur && controller.blur();
}

function didClose(e) {
	controller.terminate && controller.terminate();
}

function didClickLeftNavView(e) {
	if (controller.backButtonHandler && controller.backButtonHandler()) {
		return;
	}
	app.navigator.close(1, e && e.source == $.window);
}

function showNavBar() {
	$.actionBar.show();
}

function hideNavBar() {
	$.actionBar.hide();
}

function setRightNavButton(widget) {
	var activity = $.window.getActivity();
	activity.onCreateOptionsMenu = function(e) {
		var menu = e.menu;
		menu.clear();
		if (widget && widget.__iamalloy) {
			widget.setMenu(menu);
		}
	};
	activity.invalidateOptionsMenu();
}

exports.focus = focus;
exports.blur = blur;
exports.ctrlPath = controller ? controller.__controllerPath : "";
