var args = arguments[0] || {};
function focus() {
	$.mgrAccountExistsLbl.text = String.format($.strings.mgrAccountExistsLbl, Alloy.CFG.client_name);
}

function didClickSignIn() {
	$.app.navigator.open({
		titleid : "titleLogin",
		ctrl : "login",
		ctrlArguments : {
			username : args.username,
			password : args.password,
			is_adult_partial : true
		},
		stack : true
	});
}

exports.focus = focus; 