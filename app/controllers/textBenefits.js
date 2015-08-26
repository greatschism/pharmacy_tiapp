var args = arguments[0] || {};
function init() {
	$.uihelper.getImage("text_benefits", $.textBenefitsImage);
}

function didClickTextSignup() {

	$.app.navigator.open({
		titleid : "titleChangePhone",
		ctrl : "phone",
		ctrlArguments : {
			username : args.username,
			signup : true
		},
		stack : true
	});
}

function didClickSkipTextSignup() {
	var isFamilyMemberFlow = $.utilities.getProperty("familyMemberFlow", false, "bool", true);
	var isFamilyMemberAddPrescFlow = $.utilities.getProperty("familyMemberAddPrescFlow", true, "bool", true);
	if (isFamilyMemberFlow) {
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
			stack : true
		});
	} else {
		$.app.navigator.open({
			titleid : "titleHome",
			ctrl : "home",
			stack : false
		});
	}
}
exports.init = init;
