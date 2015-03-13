var args = arguments[0] || {},
    app = require("core"),
    config = require("config"),
    rootWindow = args.rootWindow || app.rootWindow,
    controller;

(function() {

	if (args.navBarHidden === true) {
		hideNavBar(false);
	}

	//rootWindow.title = args.title || Alloy.Globals.strings[args.titleid || ""] || "";

	//rootWindow.setLeftNavButton($.leftNavView);

	//reload tss of this controller in memory
	config.updateTSS(args.ctrl);

	controller = Alloy.createController(args.ctrl, args.ctrlArguments || {});

	_.each(controller.getTopLevelViews(), function(child) {
		if (child.__controllerPath) {
			child = child.getView();
		}
		switch(child.role) {
		case "rightNavButton":
			//rootWindow.setRightNavButton(child);
			break;
		default:
			$.containerView.add(child);
		}
	});

	_.isFunction(controller.setParentViews) && controller.setParentViews($.containerView);

	rootWindow.add($.containerView);

})();

function didClickLeftNavBtn(e) {
	app.navigator.drawer.toggleLeftWindow();
}

function showNavBar(_animated, _callback) {

}

function hideNavBar(_animated, _callback) {

}

exports.child = controller;
exports.showNavBar = showNavBar;
exports.hideNavBar = hideNavBar;