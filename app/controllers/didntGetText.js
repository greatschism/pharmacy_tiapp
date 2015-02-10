var args = arguments[0] || {};

function didClickSendTxtAgain(){
	
	app.navigator.open({
		ctrl :  "textToApp",
		titleid : "",
		stack : true
	});
	
}


function didClickGoToFullRegistr(){
	
	app.navigator.open({
		ctrl :  "fullSignup",
		titleid : "",
		stack : true
	});
	
}
