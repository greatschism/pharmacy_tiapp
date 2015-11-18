/**
 * menu
 * without family care
 */
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
		"ctrl" : "refill",
		"icon" : "refill_camera",
		"requires_login" : false
	}, {
		"titleid" : "titleReminders",
		"ctrl" : "reminders",
		"icon" : "thick_reminder",
		"requires_login" : true
	}, {
		"titleid" : "titleStores",
		"ctrl" : "stores",
		"icon" : "thick_pharmacy",
		"requires_login" : false
	}, {
		"titleid" : "titleTransfer",
		"ctrl" : "transfer",
		"icon" : "thick_transfer",
		"requires_login" : false
	}, {
		"titleid" : "titleDoctors",
		"ctrl" : "doctors",
		"icon" : "thick_doctor",
		"requires_login" : true
	}, {
		"titleid" : "titleAccount",
		"ctrl" : "account",
		"icon" : "thick_account",
		"requires_login" : true
	}]
};

