var args=arguments[0]||{};
function init(){
	$.uihelper.getImage("child_add",$.childSuccessImg);
	/**
	 * Set property to indicate family accounts for text signup flow
	 */
	$.utilities.setProperty((Alloy.Globals.isLoggedIn ? Alloy.Collections.patients.at(0).get("email_address") + "-familyAccounts" : args.username + "-familyAccounts"), true, "bool", true);	
}
function didClickAddChild(){
	$.app.navigator.open({
		titleid:"titleChildAdd",
		ctrl : "childAdd",
		ctrlArguments:{
			username:args.username,
			isFamilyMemberFlow:false
		},
		stack : true
	});
}
function didClickContinue(){
	$.app.navigator.open({
		titleid:"titleTextBenefits",
		ctrl : "textBenefits",
		ctrlArguments:{
			username:args.username,
			isFamilyMemberFlow:false
		},
		stack : true
	});
}
exports.init=init;
