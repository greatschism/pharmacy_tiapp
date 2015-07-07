var args = arguments[0] || {},
    app = require("core"),
    controller;

(function() {

	var strings = Alloy.Globals.strings;

	$.window = app.navigator.rootWindow;

	$.actionBar = $.window.getActivity().actionBar;

	if (args.navBarHidden) {
		hideNavBar();
	} else if (app.navigator.rootNavBarHidden) {
		showNavBar();
	}

	var title = args.title || strings[args.titleid || ""] || "";

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
