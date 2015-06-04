var Alloy = require("alloy");

var TiAnalytics = {
	featureEvent : function(name, data) {
		if (Alloy.CFG.analytics_enabled) {
			Ti.Analytics.featureEvent(name, data || {});
		}
	},
	getLastEvent : function() {
		return Ti.Analytics.lastEvent || {};
	},
	navEvent : function(from, to, name, data) {
		if (Alloy.CFG.analytics_enabled) {
			Ti.Analytics.navEvent(from, to, name || "", data || {});
		}
	}
};

module.exports = TiAnalytics;
