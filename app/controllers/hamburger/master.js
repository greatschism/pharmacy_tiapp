var args = arguments[0] || {},
    app = require("core"),
    uihelper = require("uihelper");

function initHamburger() {
	app.init({
		type : "hamburger",
		drawer : $.drawer,
		navigationWindow : $.navigationWindow || null,
		rootWindow : $.rootWindow
	});
	$.menuCtrl.init(args.navigation);
	if (args.triggerUpdate === true) {
		app.update(updateCallback);
	}
}

function updateCallback() {
	app.navigator.open(_.findWhere(Alloy.Collections.menuItems.toJSON(), {
		landing_page : true
	}));
	Alloy.Collections.menuItems.trigger("reset");
}

function didOpen(e) {
	if (!_.isEmpty(app.navigator)) {
		app.terminate();
	}
	if (OS_ANDROID) {
		$.rootWindow = this;
		$.rootWindow.addEventListener("androidback", function didAndoridBack() {
			app.navigator.close(1, true);
		});
		var actionBar = $.rootWindow.getActivity().actionBar;
		if (actionBar) {
			actionBar.setHomeButtonEnabled(true);
			actionBar.setOnHomeIconItemSelected(function() {
				app.navigator.drawer.toggleLeftWindow();
			});
		}
		var abextras = require("com.alcoapps.actionbarextras");
		abextras.setWindow($.rootWindow);
		abextras.setBackgroundColor(Alloy.TSS.Window.barColor);
		abextras.setFont(Alloy.TSS.Window.titleAttributes.font);
		abextras.setColor(Alloy.TSS.Window.titleAttributes.color);
		abextras.setLogo({
			icon : Alloy.CFG.icons.hamburger,
			fontFamily : Alloy.TSS.nav_icon_btn.font.fontFamily,
			color : Alloy.TSS.nav_icon_btn.color
		});
	}
	initHamburger();
	$.drawer.centerWindow.accessibilityHidden = false;
	$.drawer.leftWindow.accessibilityHidden = false;
}

function didLeftWindowOpen(e) {
	uihelper.requestForFocus($.menuCtrl.getView());
}

function didClose(e) {
	$.menuCtrl.terminate();
}

$.drawer.open();
