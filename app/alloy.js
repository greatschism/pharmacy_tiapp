(function() {

	//convert seconds to milliseconds
	_.each(["http_timeout", "location_timeout"], function(prop) {
		Alloy.CFG[prop] = Alloy.CFG[prop] * 1000;
	});

	//icons notation to character
	_.each(Alloy.CFG.iconNotations, function(val, key) {
		Alloy.CFG.icons[key] = String.fromCharCode(val);
	});

	//variables
	Alloy.Globals.Map = require("ti.map");
	Alloy.Globals.loggedIn = false;
	Alloy.Globals.isVirtualDevice = Ti.Platform.model === "Simulator" || Ti.Platform.model.indexOf("sdk") !== -1;

	/**
	 * Alloy.createModel / Alloy.createCollection can be used only when we need to get / set data in persistent storage (sqlite)
	 * Backbone is directly accessed for temporary storage & to utilize the backbone events
	 */
	//collections
	Alloy.Collections.menuItems = new Backbone.Collection();
	Alloy.Collections.termsAndConditions = new Backbone.Collection();
	Alloy.Collections.prescriptions = new Backbone.Collection();
	Alloy.Collections.sortPreferences = new Backbone.Collection();
	Alloy.Collections.stores = new Backbone.Collection();
	Alloy.Collections.doctors = new Backbone.Collection();

	//models
	Alloy.Models.user = new Backbone.Model({
		logged_in : false,
		patients : {},
		appload : {}
	});
	Alloy.Models.doctor = new Backbone.Model({
		doctor_add : {},
		doctor_remove : {},
		doctor_update : {},
	});
	Alloy.Models.template = new Backbone.Model();
	Alloy.Models.store = new Backbone.Model();

	//events
	Alloy.Models.user.on("change:patients", function didLoginChange() {
		Alloy.Globals.loggedIn = Alloy.Models.user.get("logged_in");
	});

	require("com.scule.encrypted").init();

})();