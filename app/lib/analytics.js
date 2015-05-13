var Alloy = require("alloy");

var TiAnalytics = {
	featureEvent : function(_name, _data) {
		if (Alloy.CFG.ANALYTICS_ENABLED) {
			Ti.Analytics.featureEvent(_name, _data || {});
		}
	},
	getLastEvent : function() {
		return Ti.Analytics.lastEvent || {};
	},
	navEvent : function(_from, _to, _name, _data) {
		if (Alloy.CFG.ANALYTICS_ENABLED) {
			Ti.Analytics.navEvent(_from, _to, _name || "", _data || {});
		}
	}
};

module.exports = TiAnalytics;
