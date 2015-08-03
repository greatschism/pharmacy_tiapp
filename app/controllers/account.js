var args = arguments[0] || {},
    moment = require("alloy/moment"),
    authenticator = require("authenticator"),
    localization = require("localization"),
    apiCodes = Alloy.CFG.apiCodes,
    isWindowOpen,
    phone_formatted;

function init() {
	$.mobileNumberValue.text = Alloy.Models.patient.get("mobile_number") || $.strings.strNotAvailable;
	$.emailValue.text = Alloy.Models.patient.get("email_address") || $.strings.strNotAvailable;
	$.hideExpiredPrescriptionSwt.setValue((parseInt(Alloy.Models.patient.get("hide_expired_prescriptions")) || 0) ? true : false);
	$.hideZeroRefillPrescriptionSwt.setValue((parseInt(Alloy.Models.patient.get("hide_zero_refill_prescriptions")) || 0) ? true : false);
	$.timeZoneReplyLbl.text = Alloy.Models.patient.get("pref_timezone");
	$.languageReplyLbl.text = Alloy.Models.patient.get("pref_language");
	$.keepMeSignedInSwt.setValue(authenticator.getAutoLoginEnabled());
	$.timeZonePicker.setItems(Alloy.Models.timeZone.get("code_values"));
	$.languagePicker.setItems(Alloy.Models.language.get("code_values"));
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
}

function didGetStore(result) {
	phone_formatted = $.utilities.formatPhoneNumber(result.data.stores.phone);
}

function didChangeAutoLogin(e) {
	var value = e.value;
	authenticator.setAutoLoginEnabled(value);
	if (Alloy.CFG.auto_login_dialog_enabled && value) {
		$.uihelper.showDialog({
			message : $.strings.loginMsgAutoLogin
		});
	}
}

function didClickmobileNumber(e) {
	$.app.navigator.open({
		titleid : "titleChangePhone",
		ctrl : "phone",
		stack : true
	});
}

function didClickEmailAddress(e) {
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
}

function didClickCloseLanguage(e) {
	$.languageReplyLbl.text = $.languagePicker.getSelectedItems()[0].code_display;
	$.languagePicker.hide();
}

function didClickContactSupport(e) {
	$.contactOptionsMenu.show();
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

function callhomePharmacy(){
	/*httpClient = $.http.request({
		method : "stores_list",
		params : {
			feature_code : "THXXX",
			data : [{
				stores : reqStoreObj
			}]
		},
		passthrough : _.isUndefined(shouldUpdateRegion) ? true : shouldUpdateRegion,
		errorDialogEnabled : _.isUndefined(errorDialogEnabled) ? true : errorDialogEnabled,
		showLoader : false,
		success : didGetStores,
		failure : didGetStores*/
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
		$.uihelper.openEmailDialog([supportEmail]);
		break;
	case 2:
		if (phone_formatted) {
			$.uihelper.openDialer(phone_formatted);
		}
		else{
			callhomePharmacy();
		}
		break;
	}
}

exports.init = init;
exports.focus = focus;
exports.backButtonHandler = backButtonHandler;
