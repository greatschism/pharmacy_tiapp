(function() {

	var Locale = require("localization");
	Locale.init();
	Alloy.Globals.Strings = Locale.currentLanguage.strings;

	Alloy.Globals.Map = OS_MOBILEWEB ? Ti.Map : require("ti.map");

	Alloy.Collections.termsAndConditions = new Backbone.Collection();
	Alloy.Collections.menuItems = new Backbone.Collection(Alloy.CFG.menuItems);
	Alloy.Collections.stores = new Backbone.Collection();
	Alloy.Collections.storeHours = new Backbone.Collection();
	Alloy.Collections.storeServices = new Backbone.Collection();
	Alloy.Collections.upcomingAppointments = new Backbone.Collection();
	Alloy.Collections.doctors = new Backbone.Collection();
	Alloy.Collections.prescriptions = new Backbone.Collection();
	Alloy.Collections.chooseTime = new Backbone.Collection();
	Alloy.Collections.gettingRefilled = new Backbone.Collection();
	Alloy.Collections.readytoRefill = new Backbone.Collection();

	Alloy.Models.user = new Backbone.Model({
		loggedIn: false,
		sessionId: "",
		appLoad: {}
	});
	Alloy.Models.store = new Backbone.Model();
	Alloy.Models.doctor = new Backbone.Model();
})();