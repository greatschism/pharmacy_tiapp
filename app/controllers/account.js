var args = arguments[0] || {},
    moment = require("alloy/moment"),
    authenticator = require("authenticator"),
    localization = require("localization"),
    apiCodes = Alloy.CFG.apiCodes,
    isWindowOpen,
    phone_formatted;

function init() {
	$.mobileNumberValue.text = Alloy.Models.patient.get("mobile_number") === "null" ? $.strings.accountReplySignUpForText : $.strings.strNotAvailable;
	$.emailValue.text = Alloy.Models.patient.get("email_address") || $.strings.strNotAvailable;
	$.hideExpiredPrescriptionSwt.setValue((parseInt(Alloy.Models.patient.get("hide_expired_prescriptions")) || 0) ? true : false);
	$.hideZeroRefillPrescriptionSwt.setValue((parseInt(Alloy.Models.patient.get("hide_zero_refill_prescriptions")) || 0) ? true : false);
	$.timeZoneReplyLbl.text = getTimeZone();
	$.languageReplyLbl.text = Alloy.Models.patient.get("pref_language");
	$.keepMeSignedInSwt.setValue(authenticator.getAutoLoginEnabled());
	$.timeZonePicker.setItems(Alloy.Models.timeZone.get("code_values"));
	$.languagePicker.setItems(Alloy.Models.language.get("code_values"));
}

function getTimeZone(){
	return _.find(Alloy.Models.timeZone.get("code_values"), function(val){
			return val.code_value == Alloy.Models.patient.get("pref_timezone");
		}).code_display;
}

function focus() {
	if (!isWindowOpen) {
		isWindowOpen = true;
		/**
		 * Get the last refilled store details. This is required to contact the store 
		 */
		var storeId = $.utilities.getProperty(Alloy.CFG.latest_store_refilled);
		if (storeId) {
			$.http.request({
				method : "stores_get",
				params : {
					feature_code : "THXXX",
					data : [{
						stores : {
							id : storeId
						}
					}]
				},
				success : didGetStore
			});
		}
	}
	
	$.mobileNumberValue.text = Alloy.Models.patient.get("mobile_number") === "null" ? $.strings.accountReplySignUpForText : $.strings.strNotAvailable;
	$.emailValue.text = Alloy.Models.patient.get("email_address") || $.strings.strNotAvailable;
}

function updateUserPreferences(key, value){
	/**
	 * patient model has attributes other than user preferenes. Hence using 'Models.pick' to retieve only those attributes that are required to update the preferences
	 */
	var userPrefsKeys = ["show_rx_names_flag", "pref_language", "pref_prescription_sort_order", "hide_expired_prescriptions", "hide_zero_refill_prescriptions", "pref_timezone", "onphone_reminder_duration_in_days", "rx_refill_duration_in_days", "doctor_appointment_reminder_flag", "med_reminder_flag", "app_reminder_flag", "refill_reminder_flag", "email_msg_active", "text_msg_active"];
	var userPrefObject = Alloy.Models.patient.pick(userPrefsKeys);
	userPrefObject[key] = value;
	Alloy.Models.patient.set(key, value);
	
	$.http.request({
		method : "patient_preferences_update",
		params : {
			feature_code : "THXXX",
			filter : [],
			data : [userPrefObject]
		},
		success : didUpdatePrefs
	});
}

function didUpdatePrefs(){
	//do nothing
}

function didGetStore(result) {
	phone_formatted = $.utilities.formatPhoneNumber(result.data.stores.phone);
}

function didChangeAutoLogin(e) {
	var value = e.value;
	authenticator.setAutoLoginEnabled(value);
	if (Alloy.CFG.auto_login_dialog_enabled && value) {
		$.uihelper.showDialog({
			message : $.strings.msgAutoLogin
		});
	}
}

function didClickmobileNumber(e) {
	if(Alloy.Models.patient.get("mobile_number") != "null"){
		$.app.navigator.open({
			titleid : "titleChangePhone",
			ctrl : "phone",
			stack : true
		});
	}
	else{
		$.app.navigator.open({
			ctrl : "textBenefits",
			titleid : "titleTextBenefits",
			stack : true
		});
	}
}

function didClickEmailAddress(e) {
	/**
	 * We cant change email address for few clients with private LDAP. So check for the configurable value and stop the user from editing  
	 */
	if(!Alloy.CFG.can_update_email){
		return;
	}
	$.app.navigator.open({
		titleid : "titleChangeEmail",
		ctrl : "email",
		stack : true
	});
}

function didClickTimeZone(e) {
	$.timeZonePicker.show();
}

function didClickLanguage(e) {
	$.languagePicker.show();
}

function didClickCloseTimeZone(e) {
	$.timeZoneReplyLbl.text = $.timeZonePicker.getSelectedItems()[0].code_display;
	$.timeZonePicker.hide();
	updateUserPreferences("pref_timezone", $.timeZonePicker.getSelectedItems()[0].code_value);
	authenticator.setTimeZone($.timeZoneReplyLbl.text);
}

function didClickCloseLanguage(e) {
	$.languageReplyLbl.text = $.languagePicker.getSelectedItems()[0].code_display;
	$.languagePicker.hide();
	updateUserPreferences("pref_language", $.languagePicker.getSelectedItems()[0].code_display);
}

function didClickContactSupport(e) {
	$.contactOptionsMenu.show();
}

function didChangeHideExpPrescription(){
	updateUserPreferences("hide_expired_prescriptions" , $.hideExpiredPrescriptionSwt.getValue() === true? "1" : "0");
}

function didChangeHideZeroRefillPrescription(){
	updateUserPreferences("hide_zero_refill_prescriptions" , $.hideZeroRefillPrescriptionSwt.getValue() === true? "1" : "0");
}

function didClickViewAgreement() {
	$.app.navigator.open({
		titleid : "titleAccountAgreements",
		ctrl : "termsAndConditions",
		stack : true
	});
}

function backButtonHandler() {
	if ($.timeZonePicker.getVisible()) {
		return $.timeZonePicker.hide();
	}
	if ($.languagePicker.getVisible()) {
		return $.languagePicker.hide();
	}
	/**
	 * yet to discuss when the api can be called
	 * and changes will be applied
	 */
	return false;
}

function getHomePharmacy(){
	/**
	 *step 1: get the stores, step 2: Identify the home pharmacy, step 3: get store details for home pharmacy, step 4: from the details, get the phone number  
	 */
	$.http.request({
		method : "stores_list",
		params : {
			feature_code : "THXXX",
			data : [{
				stores : {
					search_criteria: "",
			        user_lat: "",
			        user_long: "",
			        search_lat: "",
			        search_long: "",
			        view_type: "LIST"
				}
			}]
		},
		success : didGetStoreList
	});
}

function didGetStoreList(result) {
	if (result && result.data) {
		_.each(result.data.stores.stores_list, function(store){
			if(parseInt(store.ishomepharmacy)){
				$.http.request({
					method : "stores_get",
					params : {
						feature_code : "THXXX",
						data : [{
							stores : {
								id : store.id
							}
						}]
					},
					showLoader : false,
					success : didGetStore
				});
			}
		}); 
	}
}

function didGetStore(result) {
	if (result && result.data) {
		$.uihelper.openDialer(result.data.stores.phone);
	}
}

function didClickcontactOptionsMenu(e){
	switch(e.index) {
	case 0:
		var supportPhone = Alloy.Models.appload.get("supportphone");
		if (supportPhone) {
			$.uihelper.openDialer(supportPhone);
		}
		break;
	case 1:
		var supportEmail = Alloy.Models.appload.get("supportemail_to");
		$.uihelper.openEmailDialog({
			toRecipients: [supportEmail]
		});
		break;
	case 2:
		if (phone_formatted) {
			$.uihelper.openDialer(phone_formatted);
		}
		else{
			getHomePharmacy();
		}
		break;
	}
}

exports.init = init;
exports.focus = focus;
exports.backButtonHandler = backButtonHandler;
