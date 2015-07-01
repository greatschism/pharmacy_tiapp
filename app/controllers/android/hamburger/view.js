var args = arguments[0] || {},
    app = require("core"),
    controller;

(function() {

	$.window = app.navigator.rootWindow;

	$.actionBar = $.window.getActivity().actionBar;

	if (args.navBarHidden) {
		hideNavBar();
	} else if (app.navigator.rootNavBarHidden) {
		showNavBar();
	}

	var title = args.title || Alloy.Globals.strings[args.titleid || ""] || "";

	$.window.title = title;

	$.actionBar.setTitleAttributes(_.extend({
		title : title
	}, Alloy.TSS.Window.titleAttributes));

	var hasRightNavButton = false;

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
			hasRightNavButton = true;
			setRightNavButton(child);
			break;
		case "contentView":
			$.contentView = child;
			break;
		default:
			if (!$.contentView) {
				$.contentView = $.UI.create("View", {
					apiName : "View",
					id : "contentView"
				});
			}
			$.contentView.add(child);
		}
	});

	$.addTopLevelView($.contentView);

	if (!hasRightNavButton) {
		setRightNavButton();
	}

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

	controller.setParentViews && controller.setParentViews($.contentView);

})();

function focus(e) {
	controller.focus && controller.focus();
}

function blur(e) {
	controller.blur && controller.blur();
}

function terminate(e) {
	controller.terminate && controller.terminate();
}

function showNavBar() {
	$.actionBar.show();
	app.navigator.rootNavBarHidden = false;
}

function hideNavBar() {
	$.actionBar.hide();
	app.navigator.rootNavBarHidden = true;
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
exports.terminate = terminate;
exports.ctrlPath = controller ? controller.__controllerPath : "";
