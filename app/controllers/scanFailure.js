var args = arguments[0] || {},
    app = require("core"),
    num=9999999999;
    numNotLog=6666666666;
function didClickType(e) {
	var scan=1;
	app.navigator.open({
		ctrl : "refillTypeRx",
		titleid: "titleRefillNow",
		stack : true,
		ctrlArguments : {
				isScan:scan,
			}
	});
}

function phoneDialer(e) {
	//alert("clicked");
	var number = "tel:+" + String(doctor.phone);
	Ti.Platform.openURL(number);
}


function didClickCallPharmacy(e) {
	var type=1;
	if(sessionId!=""){
		function phoneDialer(e) {
	//alert("clicked");
	var number = "tel:+" + String(num);
	Ti.Platform.openURL(number);
}
	}
	else {
		
		if(cache==1)
		{
			function phoneDialer(e) {
	//alert("clicked");
	var number = "tel:+" + String(num);
	Ti.Platform.openURL(number);
}
		}
		
		
	}
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