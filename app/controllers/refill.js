var args = arguments[0] || {},
    app = require("core");
    
function didClickScan(e) {
	var scan=1;
	app.navigator.open({
		ctrl : "refillMobileNumber",
		titleid: "strRefillNow",
		stack : true,
		ctrlArguments : {
				isScan:scan,
			}
	});
}

function didClickType(e) {
	var type=1;
	 app.navigator.open({
	 	ctrl : "refillMobileNumber",
		titleid: "strRefillNow",
		stack : true,
		ctrlArguments : {
				isTyped:type,
			}
		 
	});
	
}