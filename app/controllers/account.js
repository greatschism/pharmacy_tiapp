var args = arguments[0] || {},
    moment = require("alloy/moment"),
    authenticator = require("authenticator"),
    localization = require("localization"),
    apiCodes = Alloy.CFG.apiCodes,
    isWindowOpen;

function init() {
	$.mobileNumberValue.text = Alloy.Models.patient.get("mobile_number") || $.strings.strNotAvailable;
	$.emailValue.text = Alloy.Models.patient.get("email_address") || $.strings.strNotAvailable;
	$.hideExpiredPrescriptionSwt.setValue((parseInt(Alloy.Models.patient.get("hide_expired_prescriptions")) || 0) ? true : false);
	$.hideZeroRefillPrescriptionSwt.setValue((parseInt(Alloy.Models.patient.get("hide_zero_refill_prescriptions")) || 0) ? true : false);
	$.timeZoneReplyLbl.text = Alloy.Models.patient.get("pref_timezone");
	$.languageReplyLbl.text = Alloy.Models.patient.get("pref_language");
	$.keepMeSignedInSwt.setValue(authenticator.getAutoLoginEnabled());
}

function getLanguageAndTimeZoneCodes() {
	$.http.request({
		method : "codes_get",
		params : {
			feature_code : "THXXX",
			data : [{
				codes : [{
					code_name : apiCodes.code_language
				},{
					code_name : apiCodes.code_time_zone
				}]
			}]
		},
		forceRetry : true,
		success : didgetLanguageAndTimeZoneCodes
	});
}

function focus() {
	if (!isWindowOpen) {
		isWindowOpen = true;
		/**
		 * ensure that if time zone is available,
		 * language also should be available
		 */
		if (Alloy.Models.timeZone.get("code_values")) {
			setCodes();
		} else {
			getLanguageAndTimeZoneCodes();
		}
	}
}

function appendFlag(codes, selectedValue) {
	_.each(codes, function(code) {
		code.selected = code.code_value === selectedValue;
	});
}

function didgetLanguageAndTimeZoneCodes(result, passthrough) {
	Alloy.Models.language.set(result.data.codes[0]);
	Alloy.Models.timeZone.set(result.data.codes[1]);
	appendFlag(Alloy.Models.timeZone.get("code_values"), Alloy.Models.patient.get("pref_timezone"));
	appendFlag(Alloy.Models.language.get("code_values"), localization.currentLanguage.code);
	setCodes();
}

function setCodes() {
	$.timeZonePicker.setItems(Alloy.Models.timeZone.get("code_values"));
	$.languagePicker.setItems(Alloy.Models.language.get("code_values"));
	/**
	 * alert if user is on different time zone
	 * to do: find a better way that suits our
	 * time zone api's data set
	 */
	var timezone = require("alloy/jstz").determine().name();
	if (moment().format(Alloy.CFG.date_time_format) != moment().tz(timezone).format(Alloy.CFG.date_time_format)) {
		$.uihelper.showDialog({
			title : $.strings.accountsLblTimeZone,
			message : $.strings.accountsMsgTimeZone,
			buttonNames : [$.strings.dialogBtnYes, $.strings.dialogBtnNo],
			cancelIndex : 1,
			success : didConfirmTimeZone
		});
	}
}

function didConfirmTimeZone() {
	/** todo
	 * update time zone
	 * have to check against available time zones
	 */
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

}

function didClickEmailAddress(e) {

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

}

function didClickViewAgreement() {
	$.app.navigator.open({
		titleid : "titleAccountAgreements",
		ctrl : "termsAndConditions",
		stack : true
	});
}

function didClickEdit() {

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

exports.init = init;
exports.focus = focus;
exports.backButtonHandler = backButtonHandler;
