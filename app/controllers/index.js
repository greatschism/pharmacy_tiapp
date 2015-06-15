(function() {
	//Run and wait for completing unit test under development and test environment
	if (!ENV_PROD) {
		require("specs/app_test").run(init);
	} else {
		init();
	}
})();

function init() {
	Alloy.createController("appload");
}
