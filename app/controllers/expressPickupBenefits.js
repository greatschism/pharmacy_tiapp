var args = $.args;

function didClickPickupSignup() {
	
}

function didClickSkipPickupSignup() {
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