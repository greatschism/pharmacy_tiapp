var args = arguments[0] || {},
    app = require("core");
    
function didClickType(e) {
	var scan=1;
	app.navigator.open({
		ctrl : "refillMobileNumber",
		titleid: "titleRefillNow",
		stack : true,
		ctrlArguments : {
				isScan:scan,
			}
	});
}

function didClickCallPharmacy(e) {
	var type=1;
	 app.navigator.open({
	 	ctrl : "refillMobileNumber",
		titleid: "titleRefillNow",
		stack : true,
		ctrlArguments : {
				isTyped:type,
			}
		 // ctrl : "orderDetails",
		 // titleid: "titleOrderDetails",
		 // stack : true
	});
	
}