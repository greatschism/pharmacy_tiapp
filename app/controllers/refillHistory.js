var args = arguments[0] || {},
    moment = require("alloy/moment"),
    app = require("core"),
    uihelper = require("uihelper"),
    http = require("requestwrapper"),
    utilities = require("utilities");
    
 function init() {
	http.request({
		method : "REFILL_HISTORY",
		data : {
			filter : null,
			data : [{
				

			}]

		},
		success : didSuccess,

	});

}
