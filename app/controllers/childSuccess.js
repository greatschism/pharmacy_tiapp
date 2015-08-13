var args=arguments[0]||{};
function init(){
	$.uihelper.getImage("child_add",$.childSuccessImg);
	/**
	 * Set property to display HIPAA during first login flow
	 */
	utilities.setProperty(args.username, "showHIPAA", "string", true);	
	
	/**
	 * Set property to indicate family accounts for text signup flow
	 */
	utilities.setProperty(args.username, "familyAccounts", "string", true);	
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
		titleid:"titleLogin",
		ctrl : "login",
		ctrlArguments : {
			username : args.username,
			password : args.password
		},
		stack : true
	});
}
exports.init=init;
