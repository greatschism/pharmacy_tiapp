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
		"icon" : "thin_prescription",
		"requires_login" : true
	}, {
		"titleid" : "titleRefill",
		"action" : "refill",
		"icon" : "thin_refill",
		"requires_login" : false
	}, {
		"titleid" : "titleReminders",
		"ctrl" : "reminders",
		"icon" : "thin_reminder",
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
		"icon" : "thin_pharmacy",
		"feature_name" : "is_storelocator_enabled",
		"requires_login" : false
	}, {
		"titleid" : "titleTransfer",
		"ctrl" : "transfer",
		"icon" : "thin_transfer",
		"feature_name" : "is_transferrx_enabled",
		"requires_login" : false
	}, {
		"titleid" : "titleDoctors",
		"ctrl" : "doctors",
		"icon" : "thin_doctor",
		"feature_name" : "is_doctors_enabled",
		"requires_login" : true
	}, {
		"titleid" : "titleAccount",
		"ctrl" : "account",
		"icon" : "thin_account",
		"requires_login" : true
	}, {
		"titleid": "titleHelp",
		"url": "http://reasors.mobilepharmacyhelp.com/",
		"icon": "thick_help",
		"requires_login": false
	}]
};
