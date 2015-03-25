var args = arguments[0] || {},
    app = require("core"),
    uihelper = require("uihelper");

function init() {
	if (OS_ANDROID) {
		var title = Alloy.Globals.strings[(args.navigation || _.findWhere(Alloy.Collections.menuItems.toJSON(), {
			landing_page : true
		})).titleid] || Ti.App.name;
		$.drawer.title = title;
		$.drawer.setActionBarProperties({
			title : "\t" + title,
			font : Alloy.TSS.Window.titleAttributes.font.fontFamily,
			color : Alloy.TSS.Window.titleAttributes.color,
			backgroundColor : Alloy.TSS.Window.barColor,
			logo : {
				icon : Alloy.CFG.icons.hamburger,
				font : Alloy.TSS.nav_icon_btn.font.fontFamily,
				color : Alloy.TSS.nav_icon_btn.color,
				accessibilityLabel : Alloy.Globals.strings.accessibilityLblNavigateMenu
			}
		});
	}
	$.drawer.open();
}

function didOpen(e) {
	$.trigger("open");
	if (!_.isEmpty(app.navigator)) {
		app.terminate();
	}
	if (OS_ANDROID) {
		$.rootWindow = this;
		var actionBar = $.rootWindow.getActivity().actionBar;
		if (actionBar) {
			actionBar.setOnHomeIconItemSelected(function() {
				app.navigator.drawer.toggleLeftWindow();
			});
		}
	}
	initHamburger();
	$.drawer.centerWindow.accessibilityHidden = false;
	$.drawer.leftWindow.accessibilityHidden = false;
}

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

function didAndoridBack(e) {
	app.navigator.close(1, true);
}

function didLeftWindowOpen(e) {
	if (OS_IOS) {
		uihelper.requestForFocus($.menuCtrl.getView());
	} else {
		setTimeout(function() {
			uihelper.requestForFocus($.menuCtrl.getView());
		}, 250);
	}
}

function didClose(e) {
	$.menuCtrl.terminate();
}

exports.init = init;
