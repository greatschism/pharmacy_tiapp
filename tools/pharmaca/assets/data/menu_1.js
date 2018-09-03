module.exports = {
	"data" : [{
		"titleid" : "titleHome",
		"ctrl" : "home",
		"icon" : "home",
		"requires_login" : false,
		"landing_page" : true
	}, {
		"titleid" : "titlePrescriptions",
		"ctrl" : "prescriptions",
		"icon" : "thick_prescription",
		"requires_login" : true
	}, {
		"titleid" : "titleRefill",
		"action" : "refill",
		"icon" : "thick_refill_now",
		"requires_login" : false
	}, {
		"titleid" : "titleReminders",
		"ctrl" : "reminders",
		"icon" : "thick_reminder",
		"feature_name" : "is_reminders_enabled",
		"requires_login" : true
	}, {
		"titleid" : "titleFamilyAccounts",
		"ctrl" : "familyCare",
		"icon" : "users",
		"feature_name" : "is_proxy_enabled",
		"requires_login" : true
	}, {
		"titleid" : "titleStores",
		"ctrl" : "stores",
		"icon" : "thick_pharmacy",
		"feature_name" : "is_storelocator_enabled",
		"requires_login" : false
	}, {
		"titleid" : "titleTransfer",
		"ctrl" : "transfer",
		"icon" : "thick_transfer",
		"feature_name" : "is_transferrx_enabled",
		"requires_login" : false
	}, {
		"titleid" : "titleDoctors",
		"ctrl" : "doctors",
		"icon" : "thick_doctor",
		"feature_name" : "is_doctors_enabled",
		"requires_login" : true
	}, {
		"titleid" : "titleAccount",
		"ctrl" : "account",
		"icon" : "thick_account",
		"requires_login" : true
	}, {
		"titleid" : "titleRewardCards",
		"ctrl" : "additionalCustInfo",
		"ctrlArguments" : "RECA",
		"icon" : "insurance_card",
		"requires_login" : true
	}, {
		"titleid": "titleRewards",
		"url": "https://www.pharmacarewards.com/cp/login.aspx?RGD=90C3391A-AC59-4B3F-A164-0FAB24998D0B",
		"icon": "thick_coupon",
		"requires_login": false
	}, {
		"titleid": "titleShop",
		"url": "https://www.pharmaca.com",
		"icon": "cart",
		"requires_login": false
	}, {
		"titleid": "titleHelp",
		"url": "http://pharmaca.mobilepharmacyhelp.com/",
		"icon": "thick_help",
		"requires_login": false
	}]
};
