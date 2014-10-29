var args = arguments[0] || {},
    app = require("core");

function didOpen(e) {
	app.globalWindow = $.window;
	app.init();
	app.setNavigator({
		type : "stack"
	});
	app.Navigator.open(args);
}

$.window.open();
