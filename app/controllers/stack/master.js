var args = arguments[0] || {},
    app = require("core");

function initStack() {
	app.globalWindow = $.window;
	app.init();
	app.setNavigator({
		type : "stack"
	});
	app.navigator.open(args.navigation || Alloy.Collections.menuItems.where({
	landing_page: true
	})[0].toJSON());
	if (args.triggerUpdate === true) {
		app.update();
	}
}

function didOpen(e) {
	if (!_.isEmpty(app.navigator)) {
		app.navigator.closeAll(function() {
			app.terminate();
			initStack();
		});
	} else {
		initStack();
	}
}

$.window.open();
