(function() {

	var Locale = require("localization");
	Locale.init();
	Alloy.Globals.Strings = Locale.currentLanguage.strings;

	if (OS_IOS) {
		require("ti.styledlabel");
	}
	if (OS_IOS || OS_ANDROID) {
		require("ti.keyboard");
	}
	Alloy.Globals.Map = OS_MOBILEWEB ? Ti.Map : require("ti.map");

	Alloy.Collections.termsAndConditions = new Backbone.Collection();
	Alloy.Collections.menuItems = new Backbone.Collection();
	Alloy.Collections.stores = new Backbone.Collection();
	Alloy.Collections.storeOptions = new Backbone.Collection();
	Alloy.Collections.storeHours = new Backbone.Collection();
	Alloy.Collections.storeServices = new Backbone.Collection();
	Alloy.Collections.upcomingAppointments = new Backbone.Collection();
	Alloy.Collections.doctors = new Backbone.Collection();

	Alloy.Models.store = new Backbone.Model();

})();

