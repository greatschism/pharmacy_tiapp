var args = arguments[0] || {}, App = require("core");

(function() {
	App.globalWindow = $.window;
	App.init();

	App.setNavigator({
		type : "stack"
	});

	App.Navigator.open(args);

	$.window.open();
})();

function didClose(e) {
	App.terminate();
}