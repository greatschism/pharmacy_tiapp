var args = $.args;

function didClickMail(e) {
	var emailDialog = Ti.UI.createEmailDialog();
	
	emailDialog.subject = String.format($.strings.contactUsMailSubject, Ti.Platform.osname);
	emailDialog.toRecipients = [Alloy.Globals.strings.supportMail];	
	emailDialog.messageBody = Alloy.Globals.strings.contactUsFeedbackHeader;
	emailDialog.messageBody += Alloy.Globals.strings.contactUsMsgBody;
	emailDialog.messageBody += Alloy.Globals.strings.contactUsUserName;
	emailDialog.messageBody += Alloy.Globals.strings.contactUsUserMail;
	emailDialog.messageBody += Alloy.Globals.strings.contactUsUserPhone;	
	emailDialog.messageBody += String.format($.strings.contactUsUserDevice, Ti.Platform.model);
	emailDialog.messageBody += String.format($.strings.contactUsUDeviceOS, Ti.Platform.osname, Ti.Platform.version);
    emailDialog.messageBody += String.format($.strings.contactUsAppBuild, Alloy.CFG.app_version);
    emailDialog.messageBody += String.format($.strings.contactUsAppVer, Ti.App.version);
	emailDialog.open();
}

function didClickPatientPhone(e) {
	if(!Titanium.Contacts.hasContactsPermissions()) {
		Titanium.Contacts.requestContactsPermissions(function(result){
			if(result.success) {
				patientContactsHandler();
			}
		});
	} else {
		patientContactsHandler();
	}
}
function didClickPhysicianPhone(e) {
	if(!Titanium.Contacts.hasContactsPermissions()) {
		Titanium.Contacts.requestContactsPermissions(function(result){
			if(result.success) {
				physicianContactsHandler();
			}
		});
	} else {
		physicianContactsHandler();
	}
}

function patientContactsHandler() {
	if ($.patientPhn.text!= null) {
		$.uihelper.getPhone({
			phone : {
				work : [$.patientPhn.text]
			}
		}, $.patientPhn.text);
	}
}

function physicianContactsHandler() {
	if ($.physicianPhn.text!= null) {
		$.uihelper.getPhone({
			phone : {
				work : [$.physicianPhn.text]
			}
		}, $.physicianPhn.text);
	}
}


