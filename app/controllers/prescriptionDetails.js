var args = arguments[0] || {},
    moment = require("alloy/moment");

function init() {
	var prescription = args.prescription || {};
	$.prescriptionNameLbl.text = prescription.presc_name;
	$.refillLeftInfoLbl.text = prescription.refill_remaining_preferences;
	$.dueForRefillInfoLbl.text = moment(prescription.anticipated_refill_date, "YYYY/MM/DD").format("D/M/YY");
	$.lastRefillInfoLbl.text = prescription.latest_refill_completed_date;
	$.autoRefillSwt.setValue(true);
	$.remindMeToRefillSwt.setValue(true);
	$.setTimeSwt.setValue(true);
}

exports.init = init;
