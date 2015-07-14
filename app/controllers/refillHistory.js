var args = arguments[0] || {},
    moment = require("alloy/moment"),
    prescription = args.prescription;

function init() {
	if (!_.has(prescription, "history")) {
		$.http.request({
			method : "prescriptions_refill_history",
			params : {
				feature_code : "THXXX",
				data : [{
					refills : [{
						rxnumber : prescription.id
					}]
				}]
			},
			showLoader : false,
			errorDialogEnabled : false,
			success : didGetHistory
		});
	} else {
		setTimeout(loadHistory, 1000);
	}
}

function didGetHistory(result, passthrough) {
	console.log(result);
}

function loadHistory() {
	$.loader.hide();
}

exports.init = init;
