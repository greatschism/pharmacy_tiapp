var args = arguments[0] || {},
    app = require("core");
    
function didClickScanPrescription(e) {
	app.navigator.open({
		ctrl : "refillMobileNumber",
		titleid: "titleRefillNow",
		stack : true
	});
}

function didClickTypeRx(e) {
	 app.navigator.open({
		 ctrl : "orderDetails",
		 titleid: "titleOrderDetails",
		 stack : true
	});
	
}