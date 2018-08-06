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



