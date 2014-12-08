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
	Alloy.Collections.menuItems = new Backbone.Collection();
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

	//styles
	Alloy.Globals.config = {
		contentHeight : 48,
		borderRadius : 6,
		margin : {
			top : 24,
			bottom : 24,
			left : 16,
			right : 16
		},
		padding : {
			left : 8,
			right : 8
		},
		typography : {
			h1 : {
				fontFamily : Alloy.CFG.fonts.regular,
				fontSize : 24
			},
			h2 : {
				fontFamily : Alloy.CFG.fonts.medium,
				fontSize : 20
			},
			h3 : {
				fontFamily : Alloy.CFG.fonts.regular,
				fontSize : 16
			},
			h4 : {
				fontFamily : Alloy.CFG.fonts.medium,
				fontSize : 14
			},
			h5 : {
				fontFamily : Alloy.CFG.fonts.regular,
				fontSize : 14
			},
			h6 : {
				fontFamily : Alloy.CFG.fonts.regular,
				fontSize : 12
			}
		},
		switchTintColor : "#4bd865",
		foregroundColors : {
			primary : "#FFFFFF",
			secondary : "#000000",
			tertiary : "#F7941E",
			quaternary : "#C4C4C4"
		},
		backgroundColors : {
			primary : "#F7941E",
			secondary : "#6D6E71",
			tertiary : "#808285",
			quaternary : "#C4C4C4",
			quinary : "#EFEFF4",
			senary : "#FFFFFF"
		},
		borderColors : {
			primary : "#F7941E",
			secondary : "#C4C4C4"
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
		approvalColor : "#F6931E",
		navigator : "hamburger",
		menuItems : [{
			titleid : "titleHome",
			ctrl : "home",
			icon : "home",
			requiresLogin : false,
			landingPage : true
		}, {
			titleid : "strPrescriptions",
			ctrl : "prescriptions",
			icon : "prescriptions",
			requiresLogin : true
		}, {
			titleid : "strReminders",
			action : "reminders",
			icon : "reminder"
		}, {
			titleid : "titlePharmacyRewards",
			action : "pharmacyRewards",
			icon : "reward"
		}, {
			titleid : "titleCoupons",
			action : "coupons",
			icon : "coupon"
		}, {
			titleid : "titleFamilyAccounts",
			action : "familyAccounts",
			icon : "userlist"
		}, {
			titleid : "titleTransferPrescription",
			action : "transferPrescription",
			icon : "transfer"
		}, {
			titleid : "titleDoctors",
			ctrl : "doctors",
			icon : "doctors",
			requiresLogin : true
		}, {
			titleid : "titleRefillViaCamera",
			action : "refillViaCamera",
			icon : "refillcamera"
		}, {
			titleid : "titleStores",
			ctrl : "stores",
			icon : "pharmacies",
			requiresLogin : false
		}, {
			titleid : "titleAccount",
			ctrl : "account",
			icon : "account",
			requiresLogin : true
		}],
		homeItems : [[{
			image : "my_prescriptions.png",
			navigation : {
				titleid : "strPrescriptions",
				ctrl : "prescriptions",
				requiresLogin : true
			}
		}], [{
			image : "refill_from_a_number.png"
		}, {
			image : "transfer.png"
		}], [{
			image : "pharmacy_rewards.png"
		}, {
			image : "finda_pharmacy.png",
			navigation : {
				titleid : "titleStores",
				ctrl : "stores",
				requiresLogin : false
			}
		}, {
			image : "generics.png"
		}], [{
			image : "flu_shots.png"
		}], [{
			image : "clinic.png"
		}], [{
			image : "wellness_guide.png"
		}], [{
			image : "shop_target.png"
		}]],
		DUE_FOR_REFILL_IN_DAYS : 7
	};
	Alloy.Collections.menuItems.reset(Alloy.Globals.config.menuItems);

})();
