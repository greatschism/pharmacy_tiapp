var args = arguments[0] || {},
    app = require("core");

function initStack() {
	app.globalWindow = $.window;
	app.init();
	app.setNavigator({
		type : "stack"
	});
	app.navigator.setStartupParams(args);
	app.navigator.open(args);
	if (args.triggerUpdate === true) {
		app.update();
	}
}

function didOpen(e) {
	if (!_.isEmpty(app.navigator)) {
		app.navigator.closeToRoot(function() {
			app.navigator.close(1, function() {
				app.terminate();
				initStack();
			});
		});
	} else {
		initStack();
	}
}

$.window.open();
