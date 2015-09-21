(function() {

	/**
	 *  common js modules
	 *  to prevent empty objects being returned
	 *  this is recommended
	 */
	_.each(["alloy/moment", "alloy/moment", "alloy/moment-timezone", "alloy/underscore", "com.scule", "utilities", "encryptionUtil", "com.scule.tiencrypted", "uihelper", "core", "resources", "config", "localization", "logger", "http", "requestwrapper", "authenticator", "apm", "analytics", "barcode", "navigationHandler", "notificationHandler", "refillScan", "refillValidator"], function(module) {
		require(module);
	});

	//variables
	Alloy.Globals.Map = require("ti.map");
	Alloy.Globals.spinnerImages = [];
	Alloy.Globals.isSwipeInProgress = false;
	Alloy.Globals.isVirtualDevice = Ti.Platform.model === "Simulator" || Ti.Platform.model.indexOf("sdk") !== -1;
	Alloy.Globals.isLollipop = OS_ANDROID && Ti.Platform.Android.API_LEVEL >= 21;
	Alloy.Globals.filterAttribute = OS_IOS ? "filterableText" : "title";

	//load spinner images
	for (var i = 1; i <= 161; i++) {
		Alloy.Globals.spinnerImages.push("/images/activityindicator/layer_" + i + ".png");
	}

	/**
	 * Alloy.createModel / Alloy.createCollection can be used only when we need to get / set data in persistent storage (sqlite)
	 * Backbone is directly accessed for temporary storage & to utilize the backbone events
	 */
	//collections
	Alloy.Collections.menuItems = new Backbone.Collection();
	Alloy.Collections.banners = new Backbone.Collection();
	Alloy.Collections.stores = new Backbone.Collection();
	Alloy.Collections.prescriptions = new Backbone.Collection();
	Alloy.Collections.doctors = new Backbone.Collection();
	Alloy.Collections.remindersMed = new Backbone.Collection();
	Alloy.Collections.termsAndConditions = new Backbone.Collection();
	Alloy.Collections.patients = new Backbone.Collection();

	//models
	Alloy.Models.appload = new Backbone.Model();
	Alloy.Models.template = new Backbone.Model();
	Alloy.Models.remindersRefill = new Backbone.Model();
	Alloy.Models.states = new Backbone.Model();
	Alloy.Models.storeOriginal = new Backbone.Model();
	Alloy.Models.sortOrderPreferences = new Backbone.Model();
	Alloy.Models.pickupModes = new Backbone.Model();
	Alloy.Models.language = new Backbone.Model();
	Alloy.Models.timeZone = new Backbone.Model();
	Alloy.Models.relationship = new Backbone.Model();

})();
