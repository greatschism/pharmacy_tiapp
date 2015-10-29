var args = arguments[0] || {},
    app = require("core"),
    analytics = require("analytics"),
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

	/**
	 *  let the new controller know where it is coming from
	 *  through the origin parameter
	 */
	var ctrlArguments = args.ctrlArguments || {};
	ctrlArguments.origin = app.navigator.currentController.ctrlPath;
	controller = Alloy.createController(args.ctrl, ctrlArguments);

	_.each(controller.getTopLevelViews(), function(child) {
		if (child.__iamalloy) {
			child = child.getView();
		}
		if (!child) {
			return;
		}
		switch(child.role) {
		case "ignore":
			//just ignore
			break;
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
		httpClient : require("http"),
		utilities : require("utilities"),
		uihelper : require("uihelper"),
		analytics : analytics,
		crashreporter : require("crashreporter"),
		window : $.window,
		setTitle : setTitle,
		showNavBar : showNavBar,
		hideNavBar : hideNavBar,
		setRightNavButton : setRightNavButton,
	});

	controller.init && controller.init();

	controller.setParentView && controller.setParentView($.window);

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
		/**
		 * hide keyboard if any
		 * Note: for android the same below
		 * is handled after drawer is opned,
		 * in drawer/master.js
		 */
		if (Ti.App.keyboardVisible) {
			Ti.App.hideKeyboard();
		}
		app.navigator.drawer.toggleLeftWindow();
	}
}

function setTitle(title) {
	$.window.title = title;
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
	if (!view) {
		view = Ti.UI.createView();
	}
	view.addEventListener("click", handleEvent);
	$.window.setRightNavButton(view);
}

function handleEvent(evt) {
	analytics.handleEvent(evt);
}

exports.ctrlPath = controller.__controllerPath;
