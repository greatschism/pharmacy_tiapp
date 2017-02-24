var args = $.args;
function focus() {
	$.mgrAccountExistsLbl.text = String.format($.strings.mgrAccountExistsLbl, $.strings.strClientName);
}

function didClickSignIn() {
	$.app.navigator.open({
		titleid : "titleLogin",
		ctrl : "login",
		ctrlArguments : {
			is_adult_partial : true
		},
		stack : true
	});
}

exports.focus = focus; 