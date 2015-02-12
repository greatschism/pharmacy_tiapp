var args = arguments[0] || {},
 app = require("core");

function didClickSendTxtAgain(e){
	
	app.navigator.open({
		ctrl :  "textToApp",
		titleid : "",
		stack : true
	});
	
}


function didClickGoToFullRegistr(e){
	
	app.navigator.open({
		ctrl :  "fullSignup",
		titleid : "",
		stack : true
	});
	
}
