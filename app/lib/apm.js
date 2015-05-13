var Alloy = require("alloy");

var TiPerformance = {
	module : false,
	init : function() {
		if (Alloy.CFG.APM_ENABLED && !APM.module) {
			TiPerformance.module = require("com.appcelerator.apm");
			TiPerformance.module.init();
		}
	},
	didCrashOnLastAppLoad : function(_error) {
		if (TiPerformance.module) {
			return TiPerformance.module.didCrashOnLastAppLoad();
		}
		return false;
	},
	setUsername : function(_username) {
		if (TiPerformance.module) {
			TiPerformance.module.setUsername(_username);
		}
	},
	setOptOutStatus : function(_status) {
		if (TiPerformance.module) {
			TiPerformance.module.setOptOutStatus(_status);
		}
	},
	setMetadata : function(_key, _value) {
		if (TiPerformance.module) {
			TiPerformance.module.setMetadata(_key, _value);
		}
	},
	leaveBreadcrumb : function(_breadcrumb) {
		if (TiPerformance.module) {
			TiPerformance.module.leaveBreadcrumb(_breadcrumb || "");
		}
	},
	logHandledException : function(_error) {
		if (TiPerformance.module) {
			TiPerformance.module.logHandledException(_error || {});
		}
	}
};

module.exports = TiPerformance;
