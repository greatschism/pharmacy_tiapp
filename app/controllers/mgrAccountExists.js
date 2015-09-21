function focus(){
	$.mgrAccountExistsLbl.text= String.format($.strings.mgrAccountExistsLbl,Alloy.CFG.client_name);
}
function didClickSignIn(){
	$.app.navigator.open({
		titleid : "titleLogin",
		ctrl : "login",
		stack : true
	});
}
exports.focus=focus;