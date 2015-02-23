var args = arguments[0] || {},
    moment = require("alloy/moment"),
    app = require("core"),
    prescription;

function init() {
	prescription = args.prescription || {};
	$.prescriptionNameLbl.text = prescription.presc_name;
	$.refillLeftInfoLbl.text = prescription.refill_remaining_preferences;
	$.dueForRefillInfoLbl.text = moment(prescription.anticipated_refill_date, "YYYY/MM/DD").format("D/M/YY");
	$.lastRefillInfoLbl.text = prescription.latest_refill_completed_date;
	$.autoRefillSwt.setValue(true);
	$.remindMeToRefillSwt.setValue(true);
	$.setTimeSwt.setValue(true);
}


function didClickRefillPrescription()
{
	app.navigator.open({
			ctrl : "orderDetails",
			titleid : "titleOrderDetails",
			ctrlArguments : {
				prescription : prescription.presc_name
			},
			stack : true
	});
}




exports.init = init;
