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
		if (child.__controllerPath && !child.role) {
			child = child.getView();
		}
		if (!child) {
			return;
		}
		switch(child.role) {
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
	_.isFunction(controller.focus) && controller.focus();
}

function blur(e) {
	_.isFunction(controller.blur) && controller.blur();
}

function didClose(e) {
	_.isFunction(controller.terminate) && controller.terminate();
}

function didClickLeftNavView(e) {
	if (_.isFunction(controller.backButtonHandler) && controller.backButtonHandler()) {
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

function setRightNavButton(_widget) {
	var activity = $.window.getActivity();
	activity.onCreateOptionsMenu = function(e) {
		var menu = e.menu;
		menu.clear();
		if (_widget && _widget.__controllerPath) {
			_widget.setMenu(menu);
		}
	};
	activity.invalidateOptionsMenu();
}

exports.focus = focus;
exports.blur = blur;
exports.ctrlPath = controller ? controller.__controllerPath : "";
