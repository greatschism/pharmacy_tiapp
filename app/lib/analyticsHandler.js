var Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    moduleShortCode = require("moduleShortCode");

if (Alloy.CFG.analytics_enabled && _.has(Alloy.CFG, "ga_tracking_id")) {
	var GA = require("ti.ga");
	//enable debugging when it is not prod
	var debug = !ENV_PROD;
	GA.setDebug(debug);
	var Tracker = GA.createTracker({
		trackingId : Alloy.CFG.ga_tracking_id,
		useSecure : true,
		debug : debug
	});
}

var EventHandler = {
	startSession : function() {
		Tracker && Tracker.startSession();
	},
	endSession : function() {
		Tracker && Tracker.endSession();
	},
	trackEvent : function(category, action, label, value) {
		Tracker && Tracker.addEvent({
			category : category,
			action : action,
			label : label,
			value : value || 1
		});
	},
	trackScreen : function(screenName) {
		Tracker && Tracker.addScreenView(screenName);
	},
	handleEvent : function(from, event) {
		var source = event.section && event.section.getParent() || event.source,
		    label = source.analyticsId || source.id;
		if (label && label.indexOf("__alloyId") === -1) {
			if (source.apiName === "Ti.UI.Switch") {
				label += "-" + (source.value ? "On" : "Off");
			}
			EventHandler.trackEvent(moduleShortCode[from] + "-" + from, event.type, label);
		}
	}
};

module.exports = EventHandler;
