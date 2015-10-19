(function() {
	/**
	 * Run and wait for completing unit test cases
	 * Note: specs will be available only under
	 * development and test environment.
	 * test_case_enabled flag should be set to true
	 * through the Builder CLI
	 */
	if (!ENV_PROD && Alloy.CFG.unit_test_enabled) {
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
	Alloy.createController("appload").init();
}