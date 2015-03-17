var args = arguments[0] || {},
    app = require("core"),
    abextras = require("com.alcoapps.actionbarextras"),
    controller,
    rightNavView;

(function() {

	abextras.setWindow($.window);

	abextras.setBackgroundColor(Alloy.TSS.Window.barColor);

	abextras.setTitle({
		title : args.title || Alloy.Globals.strings[args.titleid || ""] || "",
		font : Alloy.TSS.Window.titleAttributes.font,
		color : Alloy.TSS.Window.titleAttributes.color
	});

	abextras.setLogo({
		icon : Alloy.CFG.icons.back,
		fontFamily : Alloy.TSS.nav_icon_btn.font.fontFamily,
		color : Alloy.TSS.nav_icon_btn.color
	});

	if (args.navBarHidden) {
		hideNavBar();
	}

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
		actionBar.setHomeButtonEnabled(true);
		actionBar.setOnHomeIconItemSelected(didClickLeftNavView);
	}
	if (rightNavView) {
		setRightNavButton(rightNavView);
		rightNavView = null;
	}
	_.isFunction(controller.focus) && controller.focus();
}

function didBlur(e) {
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

function showNavBar(_animated) {
	var actionBar = $.window.getActivity().actionBar;
	if (actionBar) {
		actionBar.show();
	}
}

function hideNavBar(_animated) {
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

exports.ctrlPath = controller ? controller.__controllerPath : "";
