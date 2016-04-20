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
	loadAppConifg();
}

function getStoragePermissions() {
	/**
	 * The following section has been commented, but we need to retain this
	 * peice of code in case Android-M does not work as per expectations
	 */
	/*if(!OS_IOS && !Titanium.Filesystem.hasStoragePermissions()){
		Titanium.Filesystem.requestStoragePermissions(function(result){
			if(!result.success) {
				var dialog = Ti.UI.createAlertDialog({
					message : "We’re sorry, this application will not run if you do not grant permission to store files on your device. To enable the application, please grant permission to store files on your device.",
					buttonNames : ["Retry", "Cancel"],
				});
				dialog.addEventListener("click", function(e) {
					var index = e.index;
					if (index == 0) {
						getStoragePermissions();
					} else {
						if (!OS_IOS) {
							var activity = Titanium.Android.currentActivity;
 							activity.finish();						
						};
					}
				});
				dialog.show();
				
			} else {
				loadAppConifg();
			}
		});
	} else {
		loadAppConifg();
	}*/
}

function loadAppConifg() {
	require("resources").init();
	require("config").load();
	/**
	 *  initialize crashreporter only when configurations are ready
	 *  so can be disabled from server through theme
	 */
	require("crashreporter").init();
	Alloy.createController("appload").init();
}
