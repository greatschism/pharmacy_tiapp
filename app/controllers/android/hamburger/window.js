var args = arguments[0] || {},
    app = require("core"),
    controller,
    rightNavView;

(function() {

	//reload tss of this controller in memory
	require("config").updateTSS(args.ctrl);

	var title = args.title || Alloy.Globals.strings[args.titleid || ""] || "";

	$.window.title = title;

	$.window.setActionBarProperties({
		title : "\t" + title,
		font : Alloy.TSS.Window.titleAttributes.font.fontFamily,
		color : Alloy.TSS.Window.titleAttributes.color,
		backgroundColor : Alloy.TSS.Window.barColor,
		logo : {
			icon : Alloy.CFG.icons.back,
			font : Alloy.TSS.nav_icon_btn.font.fontFamily,
			color : Alloy.TSS.nav_icon_btn.color,
			accessibilityLabel : Alloy.Globals.strings.accessibilityLblNavigateBack
		}
	});

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
			rightNavView = child;
			break;
		default:
			$.window.add(child);
		}
	});

	controller.app = app;

	controller.window = $.window;

	controller.setRightNavButton = setRightNavButton;

	controller.showNavBar = showNavBar;

	controller.hideNavBar = hideNavBar;

	_.isFunction(controller.init) && controller.init();

	_.isFunction(controller.setParentViews) && controller.setParentViews($.window);

})();

function didOpen(e) {

	var actionBar = $.window.getActivity().actionBar;
	if (actionBar) {
		actionBar.setOnHomeIconItemSelected(didClickLeftNavView);
	}

	if (rightNavView) {
		setRightNavButton(rightNavView);
		rightNavView = null;
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
	app.navigator.close();
}

function showNavBar() {
	var actionBar = $.window.getActivity().actionBar;
	if (actionBar) {
		actionBar.show();
	}
}

function hideNavBar() {
	var actionBar = $.window.getActivity().actionBar;
	if (actionBar) {
		actionBar.hide();
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
exports.ctrlPath = controller ? controller.__controllerPath : "";
