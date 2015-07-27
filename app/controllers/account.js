var args = arguments[0] || {},
    app = require("core");
    
function init() {
	
	getUserPreferences();
	
	$.mobileNumberValue.text = Alloy.Models.patient.get("mobile_number");
	$.emailValue.text = Alloy.Models.patient.get("email_address");
}

function getUserPreferences(){
	$.http.request({
		method : "preferences_get",
		params : {
			feature_code : "THXXX",
			filter: [],
			data : [{
				terms:""
			}]
		},
		success : function(result){
			$.hideExpiredPrescriptionSwt.setValue(result.data.patients.preferences.hide_expired_prescriptions);
			$.hideZeroRefillPrescriptionSwt.setValue(result.data.patients.preferences.hide_zero_refill_prescriptions);
			$.timeZoneValue.text = result.data.patients.preferences.pref_timezone;
			$.languageValue.text = result.data.patients.preferences.pref_language;
		}
	});
}

function didClickmobileNumber() {
}

function didClickEmailAddress() {
	/*app.navigator.open({
		ctrl : "changeEmailAddress",
		titleid : "titleChangeEmailAddress",
		stack : "true"
	});*/
}

function didClickTimeZone(){
	
}

function didClickLanguage(){
	
}

function didClickContactSupport(){
	
}

function didClickViewAgreement(){
	
}

function didClickEdit(){
	
}

exports.init = init;
