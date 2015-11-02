var Alloy = require("alloy");

var EventHandler = {
	featureEvent : function(name, data) {
		if (Alloy.CFG.analytics_enabled) {
			Ti.Analytics.featureEvent(name, data);
		}
	},
	navEvent : function(from, to, name, data) {
		if (Alloy.CFG.analytics_enabled) {
			Ti.Analytics.navEvent(from, to, name || "", data || {});
		}
	},
	handleEvent : function(e) {
		//console.log(JSON.stringify(e));
	}
};

module.exports = EventHandler;
