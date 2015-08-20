var args=arguments[0]||{};
function init(){
	$.uihelper.getImage("child_add",$.childSuccessImg);
	/**
	 * Set property to indicate family accounts for text signup flow
	 */
	$.utilities.setProperty(args.username + "-familyAccounts", true, "bool", true);	
}
function didClickAddChild(){
	$.app.navigator.open({
		titleid:"titleChildAdd",
		ctrl : "childAdd",
		stack : true
	});
}
function didClickContinue(){
	$.app.navigator.open({
		titleid:"titleTextBenefits",
		ctrl : "textBenefits",
		ctrlArguments:{
			username:args.username
		},
		stack : true
	});
}
exports.init=init;
