var args = arguments[0] || {};

function init() {
	$.uihelper.getImage("reminders_refill_tip", $.refillImg);
	$.uihelper.getImage("reminders_med_tip", $.medImg);
	$.uihelper.getImage("reminders_pickup_tip", $.pickupImg);
}

exports.init = init;
