var args = arguments[0] || {};

function init() {
	$.uihelper.getImage("reminders_refill_benefits_refill", $.refillImg);
	$.uihelper.getImage("reminders_refill_benefits_ready", $.readyImg);
	$.uihelper.getImage("reminders_refill_benefits_pickup", $.pickupImg);
}

exports.init = init;
