var args = arguments[0] || {},
    app = require("core"),
    moment = require("alloy/moment");

function init() {
	Alloy.Collections.prescriptionDetails.reset([{
		name : "Tramadol HCL, 20mg tab qual",
		readyAt : "1416835462"
	}]);
}


function terminate() {
	$.destroy();
	Alloy.Models.store.clear();
}

function didRefill(e) {
	app.navigator.open({
		ctrl : "refill",
		titleid : "titleOrderDetails",
		stack : true,
		ctrlArguments : {
			message : "Refill"
		}
	});
}

exports.terminate = terminate;
