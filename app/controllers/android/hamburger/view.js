var args = arguments[0] || {},
    app = require("core"),
    controller;

(function() {

	$.window = app.navigator.rootWindow;

	if (args.navBarHidden) {
		hideNavBar();
	} else if (app.navigator.rootNavBarHidden) {
		showNavBar();
	}

	var title = args.title || Alloy.Globals.strings[args.titleid || ""] || "";

	$.window.title = title;

	$.window.getActivity().actionBar.updateActionBarProperties({
		title : title
	});

	//reload tss of this controller in memory
	require("config").updateTSS(args.ctrl);

	var hasRightNavButton = false;

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
			hasRightNavButton = true;
			setRightNavButton(child);
			break;
		default:
			$.containerView.add(child);
		}
	});

	if (!hasRightNavButton) {
		setRightNavButton();
	}

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

function showNavBar() {
	var actionBar = $.window.getActivity().actionBar;
	if (actionBar) {
		actionBar.show();
		app.navigator.rootNavBarHidden = false;
	}
}

function hideNavBar() {
	var actionBar = $.window.getActivity().actionBar;
	if (actionBar) {
		actionBar.hide();
		app.navigator.rootNavBarHidden = true;
	}
}

function setRightNavButton(_view) {
	var activity = $.window.getActivity();
	activity.onCreateOptionsMenu = function(e) {
		var menu = e.menu;
		menu.clear();
		if (_view) {
			menu.add({
				actionView : _view,
				showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS
			});
		}
	};
	activity.invalidateOptionsMenu();
}

exports.focus = focus;
exports.blur = blur;
exports.terminate = terminate;
exports.ctrlPath = controller ? controller.__controllerPath : "";
