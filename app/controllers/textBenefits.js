var args = $.args;
function init() {
	if (Alloy.CFG.use_alternate_text_benefits_image) {
		$.uihelper.getImage("text_benefits_alternate", $.textBenefitsImage);
	} else {
		$.uihelper.getImage("text_benefits", $.textBenefitsImage);
	}
	if (args.isFamilyMemberFlow) {
		$.utilities.setProperty((Alloy.Globals.isLoggedIn ? Alloy.Collections.patients.at(0).get("email_address") + "-familyAccounts" : args.username + "-familyAccounts"), true, "bool", true);
	}
}

function didClickTextSignup() {
	if (args.origin === "remindersSettings") {
		remindersSettings = true;
		account = false;
	} else if (args.origin === "account") {
		account = true;
		remindersSettings = false;
	} else {
		account = false;
		remindersSettings = false;
	}
	$.app.navigator.open({
		titleid : "titleChangePhone",
		ctrl : "phone",
		ctrlArguments : {
			username : args.username,
			"remindersSettings" : remindersSettings,
			"account" : account
		},
		stack : true
	});
}

function didClickSkipTextSignup() {
	var isFamilyMemberAddPrescFlow = $.utilities.getProperty("familyMemberAddPrescFlow", false, "bool", true);
	if (args.isFamilyMemberFlow) {
		$.app.navigator.open({
			titleid : "titleFamilyAccounts",
			ctrl : "familyMemberAddSuccess",
			ctrlArguments : {
				familyRelationship : args.familyRelationship
			},
			stack : false
		});
	} else if (isFamilyMemberAddPrescFlow) {
		$.app.navigator.open({
			titleid : "titleFamilyCare",
			ctrl : "familyCare",
			stack : false
		});
	} else if (args.origin === "account" || args.origin === "remindersSettings") {
		$.app.navigator.close();
	} else {
		$.app.navigator.open({
			titleid : "titleHomePage",
			ctrl : "home",
			stack : false
		});
	}
}

exports.init = init;
