(function() {

	//variables
	Alloy.Globals.Map = require("ti.map");
	Alloy.Globals.spinnerImages = [];
	Alloy.Globals.isLoggedIn = false;
	Alloy.Globals.swipeInProgress = false;
	Alloy.Globals.filterAttribute = OS_IOS ? "filterableText" : "title";
	Alloy.Globals.isVirtualDevice = Ti.Platform.model === "Simulator" || Ti.Platform.model.indexOf("sdk") !== -1;

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

	//models
	Alloy.Models.appload = new Backbone.Model();
	Alloy.Models.template = new Backbone.Model();
	Alloy.Models.patient = new Backbone.Model();
	Alloy.Models.sortOrderPreferences = new Backbone.Model();

	//events
	Alloy.Models.patient.on("change:logged_in", function didLoginChange() {
		Alloy.Globals.isLoggedIn = Alloy.Models.patient.get("logged_in") === true;
	});

	//initialize scule tiencrypted storage engine
	require("com.scule.tiencrypted");
	//initialize moment-timezone
	require("alloy/moment-timezone");

})();
