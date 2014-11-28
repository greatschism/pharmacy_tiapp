(function() {

	var Locale = require("localization");
	Locale.init();
	Alloy.Globals.strings = Locale.currentLanguage.strings;

	Alloy.Globals.loggedIn = false;
	Alloy.Globals.currentLocation = {};
	if (Ti.Platform.model == "google_sdk" || Ti.Platform.model == "Simulator") {
		Alloy.Globals.currentLocation = {
			latitude : 12.9739156,
			longitude : 77.6172187
		};
	}

	Alloy.Globals.Map = OS_MOBILEWEB ? Ti.Map : require("ti.map");

	Alloy.Collections.termsAndConditions = new Backbone.Collection();
	Alloy.Collections.menuItems = new Backbone.Collection(Alloy.CFG.menuItems);
	Alloy.Collections.stores = new Backbone.Collection();
	Alloy.Collections.storeHours = new Backbone.Collection();
	Alloy.Collections.storeServices = new Backbone.Collection();
	Alloy.Collections.appointments = new Backbone.Collection();
	Alloy.Collections.doctors = new Backbone.Collection();
	Alloy.Collections.doctorPrescriptions = new Backbone.Collection();
	Alloy.Collections.prescriptions = new Backbone.Collection();
	Alloy.Collections.chooseTime = new Backbone.Collection();
	Alloy.Collections.gettingRefilled = new Backbone.Collection();

	Alloy.Models.user = new Backbone.Model({
		loggedIn : false,
		sessionId : "",
		appLoad : {}
	});
	Alloy.Models.store = new Backbone.Model();
	Alloy.Models.doctor = new Backbone.Model();

	Alloy.Models.user.on("change:loggedIn", function didLoginChange() {
		Alloy.Globals.loggedIn = Alloy.Models.user.get("loggedIn");
	});

	Alloy.Globals.styles = {
		colors : {
			one : "#F7941E",
			two : "#6D6E71",
			three : "#808285",
			four : "#C4C4C4",
			five : "#EFEFF4"
		},
		reminderColors : {
			one : "#AF7AC4",
			two : "#27AE60",
			three : "#F39C12",
			four : "#D35400",
			five : "#47C9AF",
			six : "#4094FC",
			seven : "#34495E",
			eight : "#D4FB79",
			nine : "#76D6FF",
			ten : "#C1382A",
			eleven : "#AAB7B7",
			twelve : "#D28874",
			thirteen : "#7C7645",
			fourteen : "#FC4063",
			fifteen : "#845FFF",
			sixteen : "#3F09F6"
		},
		addColor : "#599DFF",
		successColor : "#00A14B",
		errorColor : "#ED1C24",
		approvalColor : "#F6931E"
	};

})();
