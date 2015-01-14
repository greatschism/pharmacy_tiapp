var Alloy = require("alloy");

var Analytics = {
	featureEvent : function(_name, _data) {
		if (Alloy.CFG.enableAnalytics) {
			Ti.Analytics.featureEvent(_name, _data || {});
		}
	},
	getLastEvent : function() {
		return Ti.Analytics.lastEvent || {};
	},
	navEvent : function(_from, _to, _name, _data) {
		if (Alloy.CFG.enableAnalytics) {
			Ti.Analytics.navEvent(_from, _to, _name || "", _data || {});
		}
	}
};

module.exports = Analytics;
