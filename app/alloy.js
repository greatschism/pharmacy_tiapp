(function() {

	//icons notation to character
	var iconNotations = Alloy.CFG.iconNotations;
	for (var key in iconNotations) {
		Alloy.CFG.icons[key] = String.fromCharCode(iconNotations[key]);
	}

	//variables
	Alloy.Globals.Map = require("ti.map");
	Alloy.Globals.loggedIn = false;

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
