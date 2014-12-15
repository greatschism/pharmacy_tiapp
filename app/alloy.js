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
	_.extend(Alloy, {
		_navigator : "hamburger",
		_due_for_refill_in_days : 7,
		_content_height : 48,
		_border_radius : 6,
		_m_top : 24,
		_m_bottom : 24,
		_m_left : 16,
		_m_right : 16,
		_p_top : 16,
		_p_bottom : 16,
		_p_left : 8,
		_p_right : 8,
		_typo_h1 : {
			fontFamily : Alloy.CFG.fonts.regular,
			fontSize : 24,
		},
		_typo_height_h1 : 28,
		_typo_h2 : {
			fontFamily : Alloy.CFG.fonts.medium,
			fontSize : 20
		},
		_typo_height_h2 : 24,
		_typo_h3 : {
			fontFamily : Alloy.CFG.fonts.regular,
			fontSize : 16
		},
		_typo_height_h3 : 20,
		_typo_h4 : {
			fontFamily : Alloy.CFG.fonts.medium,
			fontSize : 14
		},
		_typo_height_h4 : 18,
		_typo_h5 : {
			fontFamily : Alloy.CFG.fonts.regular,
			fontSize : 14
		},
		_typo_height_h5 : 18,
		_typo_h6 : {
			fontFamily : Alloy.CFG.fonts.regular,
			fontSize : 12
		},
		_typo_height_h6 : 16,
		_switch_color : "#4bd865",
		_fg_primary : "#FFFFFF",
		_fg_secondary : "#000000",
		_fg_tertiary : "#F7941E",
		_fg_quaternary : "#C4C4C4",
		_fg_quinary : "#599DFF",
		_bg_primary : "#F7941E",
		_bg_secondary : "#6D6E71",
		_bg_tertiary : "#808285",
		_bg_quaternary : "#C4C4C4",
		_bg_quinary : "#EFEFF4",
		_bg_senary : "#FFFFFF",
		_br_primary : "#F7941E",
		_br_secondary : "#C4C4C4",
		_add_color : "#599DFF",
		_success_color : "#00A14B",
		_error_color : "#ED1C24",
		_approval_color : "#F6931E",
		_reminder_color : ["#AF7AC4", "#27AE60", "#F39C12", "#D35400", "#47C9AF", "#4094FC", "#34495E", "#D4FB79", "#76D6FF", "#C1382A", "#AAB7B7", "#D28874", "#7C7645", "#FC4063", "#845FFF", "#3F09F6"]
	});

	Alloy.Globals.homeItems = [[{
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
	}]];

	Alloy.Collections.menuItems.reset([{
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
		icon : "users_list"
	}, {
		titleid : "titleTransferPrescription",
		action : "transferPrescription",
		icon : "transfer"
	}, {
		titleid : "titleDoctors",
		ctrl : "doctors",
		icon : "doctors",
		requiresLogin : false
	}, {
		titleid : "titleRefillViaCamera",
		action : "refillViaCamera",
		icon : "refill_camera"
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
	}]);

})();
