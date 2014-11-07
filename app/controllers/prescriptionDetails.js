var args = arguments[0] || {},
    app = require("core"),
    moment = require("alloy/moment");

	Alloy.Collections.prescriptionDetails.reset([{

		desc : "Tramadol HCL, 20mg tab qual",
		time : "Order placed; should be ready by Tuesday 2PM."
	}]);


function terminate() {
	$.destroy();
	Alloy.Models.store.clear();
}

function didRefill(e) {
	app.navigator.open({
		ctrl : "refill",
		titleid : "titleOrderRefill",
		stack : true,
		ctrlArguments : {
			message : "Refill"
		}
	});
}

exports.terminate = terminate;
