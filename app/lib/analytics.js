var Alloy = require("alloy");

var EventHandler = {
	featureEvent : function(name) {
		if (Alloy.CFG.analytics_enabled) {
			Ti.Analytics.featureEvent(name);
		}
	},
	navEvent : function(from, to, name, data) {
		if (Alloy.CFG.analytics_enabled) {
			Ti.Analytics.navEvent(from, to, name || "", data || {});
		}
	},
	handleEvent : function(from, event) {
		var source = event.source,
		    name = source.analyticsId || source.id;
		if (name) {
			if (source.apiName === "Ti.UI.Switch") {
				name += "-" + source.value;
			}
			EventHandler.featureEvent(from + "-" + name);
		}
	}
};

module.exports = EventHandler;
