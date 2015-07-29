var args = arguments[0] || {},
    moment = require("alloy/moment"),
    authenticator = require("authenticator"),
    apiCodes = Alloy.CFG.apiCodes,
    isWindowOpen;

function init() {
	$.phoneReplyLbl.text = Alloy.Models.patient.get("mobile_number") || $.strings.strNotAvailable;
	$.emailReplyLbl.text = Alloy.Models.patient.get("email_address") || $.strings.strNotAvailable;
	$.hideExpiredSwt.setValue((parseInt(Alloy.Models.patient.get("hide_expired_prescriptions")) || 0) ? true : false);
	$.hideZeroRefillSwt.setValue((parseInt(Alloy.Models.patient.get("hide_zero_refill_prescriptions")) || 0) ? true : false);
	$.timeZoneReplyLbl.text = Alloy.Models.patient.get("pref_timezone");
	$.languageReplyLbl.text = Alloy.Models.patient.get("pref_language");
	$.autoLoginSwt.setValue(authenticator.getAutoLoginEnabled());
}

function focus() {
	if (!isWindowOpen) {
		isWindowOpen = true;
		/**
		 * if time zone is available and
		 * language also should be available
		 */
		if (Alloy.Models.timeZone.get("code_values")) {
			setCodes();
		} else {
			getCodes();
		}
	}
}

function getCodes() {
	$.http.request({
		method : "codes_get",
		params : {
			feature_code : "THXXX",
			data : [{
				codes : [{
					code_name : apiCodes.code_time_zone
				}, {
					code_name : apiCodes.code_language
				}]
			}]
		},
		forceRetry : true,
		success : didGetCodes
	});
}

function appendFlag(codes, selectedValue) {
	_.each(codes, function(code) {
		code.selected = code.code_value === selectedValue;
	});
}

function didGetCodes(result, passthrough) {
	Alloy.Models.timeZone.set(result.data.codes[0]);
	Alloy.Models.language.set(result.data.codes[1]);
	appendFlag(Alloy.Models.timeZone.get("code_values"), Alloy.Models.patient.get("pref_timezone"));
	appendFlag(Alloy.Models.language.get("code_values"), require("localization").currentLanguage.code);
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
			title : $.strings.accountDialogTitleTimeZone,
			message : $.strings.accountMsgTimeZone,
			buttonNames : [$.strings.dialogBtnYes, $.strings.dialogBtnNo],
			cancelIndex : 1,
			success : didConfirmTimeZone
		});
	}
}

function didConfirmTimeZone() {
	/**
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

function didClickPhone(e) {

}

function didClickEmail(e) {

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

function didClickContact(e) {

}

function didClickAgreement() {
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
