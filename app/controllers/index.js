(function() {
	//Run and wait for completing unit test under development and test environment
	if (!ENV_PROD) {
		require("specs/app_test").run(init);
	} else {
		init();
	}
})();

function init() {
	//initialization
	require("resources").init();
	require("config").load();
	/**
	 *  initialize apm only when configurations are ready
	 *  so can be disabled from server through theme
	 */
	require("apm").init();
	Alloy.createController("appload");
}