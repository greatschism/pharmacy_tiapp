(function() {

	/**
	 *  common js modules
	 *  to prevent empty objects being returned
	 *  this is recommended
	 */
	var moment = require("alloy/moment");
	_.each(["alloy/moment-timezone", "alloy/underscore", "styleSheets", "com.scule", "utilities", "encryptionUtil", "com.scule.tiencrypted", "uihelper", "core", "resources", "config", "localization", "logger", "http", "ctrlShortCode", "requestwrapper", "authenticator", "crashreporter", "barcode", "navigationHandler", "feedbackHandler", "rx", "refillScan", "ti-qrcode-master/qrcode"], function(module) {
		require(module);
	});

	//CFG
	/**
	 * use different key based on the platform
	 * when reminder mode is push
	 */
	Alloy.CFG.apiCodes.reminder_delivery_mode_push = Alloy.CFG.apiCodes["reminder_delivery_mode_push_".concat(Alloy.CFG.platform)];
	Alloy.CFG.apiCodes.reminder_delivery_mode_push_invalid = Alloy.CFG.apiCodes["reminder_delivery_mode_push_".concat( OS_IOS ? "android" : "ios")];

	//variables
	Alloy.Globals.Map = require("ti.map");
	Alloy.Globals.isSwipeInProgress = false;
	Alloy.Globals.latestRequest = moment().unix();
	Alloy.Globals.filterAttribute = OS_IOS ? "filter" : "title";
	Alloy.Globals.isLollipop = OS_ANDROID && Ti.Platform.Android.API_LEVEL >= 21;
	Alloy.Globals.isVirtualDevice = Ti.Platform.model === "Simulator" || Ti.Platform.model.indexOf("sdk") !== -1;

	/**
	 * Alloy.createModel / Alloy.createCollection can be used only when we need to get / set data in persistent storage (sqlite)
	 * Backbone is directly accessed for temporary storage & to utilize the backbone events
	 */
	//collections
	Alloy.Collections.menuItems = new Backbone.Collection();
	Alloy.Collections.stores = new Backbone.Collection();
	Alloy.Collections.prescriptions = new Backbone.Collection();
	Alloy.Collections.doctors = new Backbone.Collection();
	Alloy.Collections.remindersMed = new Backbone.Collection();
	Alloy.Collections.termsAndConditions = new Backbone.Collection();
	Alloy.Collections.patients = new Backbone.Collection();
	Alloy.Collections.reminderColors = new Backbone.Collection();

	//models
	Alloy.Models.appconfig = new Backbone.Model();
	Alloy.Models.appload = new Backbone.Model();
	Alloy.Models.template = new Backbone.Model();
	Alloy.Models.banner = new Backbone.Model();
	Alloy.Models.remindersRefill = new Backbone.Model();
	Alloy.Models.states = new Backbone.Model();
	Alloy.Models.storeOriginal = new Backbone.Model();
	Alloy.Models.sortOrderPreferences = new Backbone.Model();
	Alloy.Models.pickupModes = new Backbone.Model();
	Alloy.Models.language = new Backbone.Model();
	Alloy.Models.timeZone = new Backbone.Model();
	Alloy.Models.relationship = new Backbone.Model();
	Alloy.Models.counselingEligible = new Backbone.Model();

})();
