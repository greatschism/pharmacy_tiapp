var args = $.args,
    moment = require("alloy/moment"),
    authenticator = require("authenticator"),
    localization = require("localization"),
    apiCodes = Alloy.CFG.apiCodes,
    touchID = require("touchid"),
    isWindowOpen,
    phone_formatted;

function init() {
	$.patientSwitcher.set({
		title : $.strings.accountSwitcher,
		where : {
			is_adult : true
		},
		selectable : {
			is_adult : true
		},
		subtitles : [{
			where : {
				is_adult : false
			},
			subtitle : $.strings.accountPatientSwitcherSubtitleMinor
		}]
	});
		
	if (Alloy.CFG.is_fingerprint_scanner_enabled) {
		if ( OS_IOS && touchID.deviceCanAuthenticate() ) {
			$.touchIDSwt.setValue(authenticator.getTouchIDEnabled());
		} else {
			// Disabling till finger-print scanning is not enabled for android
		/*	var iDict = {};
		    iDict.enabled = false;
		    $.touchIDSwt.applyProperties(iDict);
	    */
		}		
	} else {
		authenticator.setTouchIDEnabled(false);
	}

	setAccountValues();
	getCreditCardInfo();
    setAccessibilityLabelOnSwitch($.hideExpiredPrescriptionSwt, $.strings.accountLblHideExpiredPrescription);
    setAccessibilityLabelOnSwitch($.hideZeroRefillPrescriptionSwt, $.strings.accountLblHideZeroRefillPrescription);
    setAccessibilityLabelOnSwitch($.keepMeSignedInSwt, $.strings.accountLblKeepMeSignedIn);
    $.app.navigator.hideLoader();
}

function setAccessibilityLabelOnSwitch(switchObj , strValue) {
    var iDict = {};
	if (OS_ANDROID) {
		iDict.accessibilityLabelOn = strValue;
		iDict.accessibilityLabelOff = strValue;
    } else {
		iDict.accessibilityLabel = strValue;
    }
    iDict.accessibilityHint = "Double tap to toggle";
    switchObj.applyProperties(iDict);
}

function setAccountValues(){	
	var currentPatient = Alloy.Collections.patients.findWhere({
		selected : true
	});
	
	$.mobileNumberValue.text = currentPatient.get("mobile_number") === "null" ? $.strings.accountReplySignUpForText : (currentPatient.get("is_mobile_verified") === "1") ? $.utilities.formatPhoneNumber(currentPatient.get("mobile_number")) : $.strings.accountReplyTextVerificationPending;
	$.emailValue.text = currentPatient.get("email_address") || $.strings.strNotAvailable;
	$.hideExpiredPrescriptionSwt.setValue((parseInt(currentPatient.get("hide_expired_prescriptions")) || 0) ? true : false);
	$.hideZeroRefillPrescriptionSwt.setValue((parseInt(currentPatient.get("hide_zero_refill_prescriptions")) || 0) ? true : false);
	$.timeZoneReplyLbl.text = getTimeZone(currentPatient);
	$.languageReplyLbl.text = currentPatient.get("pref_language");
	$.keepMeSignedInSwt.setValue(authenticator.getAutoLoginEnabled());
	$.timeZonePicker.setItems(Alloy.Models.timeZone.get("code_values"));
	$.languagePicker.setItems(Alloy.Models.language.get("code_values"));
	
	$.mobileInfoView.accessibilityLabel = $.mobileNumberLbl.text + "  " + $.mobileNumberValue.text;
	$.emailInfoView.accessibilityLabel = $.emailLbl.text + "  " + $.emailValue.text;
	$.timeZoneInfoView.accessibilityLabel = $.timeZonePromptLbl.text + "  " + $.timeZoneReplyLbl.text;
	$.languageInfoView.accessibilityLabel = $.languagePromptLbl.text + "  " + $.languageReplyLbl.text;
}

function getTimeZone(currentPatient) {
	return _.find(Alloy.Models.timeZone.get("code_values"), function(val) {
		return val.code_value == currentPatient.get("pref_timezone");
	}).code_display;
}

function focus() {
	$.utilities.setProperty((Alloy.Globals.isLoggedIn ? Alloy.Collections.patients.at(0).get("email_address") + "-familyAccounts" : args.username + "-familyAccounts"), false, "bool", true);	
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
	
	var currentPatient = Alloy.Collections.patients.findWhere({
		selected : true
	});
	$.mobileNumberValue.text = currentPatient.get("mobile_number") === "null" ? $.strings.accountReplySignUpForText : (currentPatient.get("is_mobile_verified") === "1") ? $.utilities.formatPhoneNumber(currentPatient.get("mobile_number")) : $.strings.accountReplyTextVerificationPending;
	$.emailValue.text = currentPatient.get("email_address") || $.strings.strNotAvailable;
}

function updateUserPreferences(key, value) {
	var prefObj = {};
	prefObj[key] = value;
	authenticator.updatePreferences(prefObj, {
		success: function(){}
	});
}

function didUpdatePrefs() {
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

function didChangeTouchID(e) {
	var value = e.value;
	authenticator.setTouchIDEnabled(value);
}



function didClickmobileNumber(e) {
	/**
	 *Making this flag false so that the flow is taken care off 
	 */
	$.utilities.setProperty("familyMemberAddPrescFlow", false, "bool", true);
	var currentPatient = Alloy.Collections.patients.findWhere({
		selected : true
	});
	if (currentPatient.get("mobile_number") != "null") {
		$.app.navigator.open({
			titleid : "titleChangePhone",
			ctrl : "phone",
			stack : true
		});
	} else {
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
	if (!Alloy.CFG.can_update_email) {
		return;
	}
	
	var currentPatient = Alloy.Collections.patients.findWhere({
		selected : true
	});
	$.app.navigator.open({
		titleid : "titleChangeEmail",
		ctrl : "email",
		ctrlArguments : {
			email : currentPatient.get("email_address"),
			emailVerification: false
		},
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

function didClickHelp(e) {
	var url = Alloy.Models.appload.get("help_text_url");
	Ti.Platform.openURL(url);
}

function didClickContactSupport(e) {
	$.contactOptionsMenu.show();
}

function didChangeHideExpPrescription() {
	updateUserPreferences("hide_expired_prescriptions", $.hideExpiredPrescriptionSwt.getValue() === true ? "1" : "0");
}

function didChangeHideZeroRefillPrescription() {
	updateUserPreferences("hide_zero_refill_prescriptions", $.hideZeroRefillPrescriptionSwt.getValue() === true ? "1" : "0");
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

function getHomePharmacy() {
	/**
	 *step 1: get the stores, step 2: Identify the home pharmacy, step 3: get store details for home pharmacy, step 4: from the details, get the phone number
	 */
	$.http.request({
		method : "stores_list",
		params : {
			data : [{
				stores : {
					search_criteria : "",
					user_lat : "",
					user_long : "",
					search_lat : "",
					search_long : "",
					view_type : "LIST"
				}
			}]
		},
		errorDialogEnabled : false,
		success : didGetStoreList,
		failure : didGetNoStore
	});
}

function didGetNoStore(){	
	var supportPhone = Alloy.Models.appload.get("supportphone");
		if (supportPhone) {
			$.uihelper.openDialer($.utilities.validatePhoneNumber(supportPhone));
		}
}
function didGetStoreList(result) {
	if (result && result.data) {
		_.each(result.data.stores.stores_list, function(store) {
			if (parseInt(store.ishomepharmacy)) {
				$.http.request({
					method : "stores_get",
					params : {
						data : [{
							stores : {
								id : store.id
							}
						}]
					},
					showLoader : false,
					success : didGetStoreListResult
				});
			}
		});
	}
}

function didGetStoreListResult(result) {
	if (result && result.data) {
		$.uihelper.openDialer($.utilities.validatePhoneNumber(result.data.stores.phone));
	}
}

function didClickcontactOptionsMenu(e) {
	/**
	 * cancel index may vary,
	 * based on arguments, so check
	 * the cancel flag before proceed
	 */
	if (e.cancel) {
		return false;
	}
	switch(e.index) {
	case 0:
		var supportPhone = Alloy.Models.appload.get("supportphone");
		if (supportPhone) {
			$.uihelper.openDialer($.utilities.validatePhoneNumber(supportPhone));
		}
		break;
	case 1:
		var supportEmail = Alloy.Models.appload.get("supportemail_to");
		$.uihelper.openEmailDialog({
			toRecipients : [supportEmail]
		});
		break;
	case 2:
		if (phone_formatted) {
			$.uihelper.openDialer($.utilities.validatePhoneNumber(phone_formatted));
		} else {
			getHomePharmacy();
		}
		break;
	}
}

function didPostlayout(e) {
	$.headerView.removeEventListener("postlayout", didPostlayout);
	var top = $.headerView.rect.height,
	    margin = $.tableView.bottom,
	    bottom;
	bottom = margin;
	
	$.tableView.applyProperties({
		top : top,
		bottom : bottom
	});
}

function didChangePatient(e){
	setAccountValues();
}

function setParentView(view) {
	$.patientSwitcher.setParentView(view);
}

function terminate() {
	//terminate patient switcher
	if ($.patientSwitcher) {
		$.patientSwitcher.terminate();
	}
}

function getCreditCardInfo(passthrough) {
	$.http.request({
		method : "payments_credit_card_get",
		params : {
			data : [
				{
					"getCreditCard": {
						"fetchAll": Alloy.CFG.fetch_all_credit_cards
					}
		        }
			]
		},
		errorDialogEnabled : false,
		passthrough: passthrough,
		success : didGetCreditCardInfo,
		failure : didFailureInCreditCardInfo
	});
}

function didGetCreditCardInfo(result, passthrough) {
	
	for(var i=0,j=result.data.CreditCard.length; i<j; i++){
		var creditCardInfo = result.data.CreditCard[i];
  		var cardType = creditCardInfo.paymentType.paymentTypeDesc;
  		var lastFourDigits = creditCardInfo.lastFourDigits;
  		var expiry_date = creditCardInfo.expiry_date;
	  
		
	};
	
}

function didClickCCEdit() {
	uihelper.showDialog({
		message : $.strings.checkoutEditCardInfo
	});
}

function didFailureInCreditCardInfo(result, passthrough) {
	
}

exports.init = init;
exports.focus = focus;
exports.backButtonHandler = backButtonHandler;
exports.terminate = terminate;
exports.setParentView = setParentView;
