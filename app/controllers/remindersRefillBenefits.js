var args = arguments[0] || {};

function init(e) {
	_.each(["refillView", "readyView", "pickupView"], function(val) {
		$.uihelper.wrapViews($[val]);
	});
}

exports.init = init;
