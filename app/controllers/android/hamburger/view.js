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
		if (child.__iamalloy) {
			child = child.getView();
		}
		if (!child) {
			return;
		}
		switch(child.role) {
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

function backButtonHandler(e) {
	return controller.backButtonHandler && controller.backButtonHandler();
}

function showNavBar() {
	$.actionBar.show();
	app.navigator.rootNavBarHidden = false;
}

function hideNavBar() {
	$.actionBar.hide();
	app.navigator.rootNavBarHidden = true;
}

function setRightNavButton(view) {
	var activity = $.window.getActivity();
	activity.onCreateOptionsMenu = function(e) {
		var menu = e.menu;
		menu.clear();
		if (view) {
			$.menuItem = menu.add({
				actionView : view,
				visible : false,
				showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS
			});
			setTimeout(function() {
				$.menuItem.setVisible(true);
			}, 150);
		}
	};
	activity.invalidateOptionsMenu();
}

exports.blur = blur;
exports.focus = focus;
exports.terminate = terminate;
exports.backButtonHandler = backButtonHandler;
exports.ctrlPath = controller.__controllerPath;
