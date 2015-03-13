var APM = {
	module : false,
	init : function() {
		if (Alloy.CFG.enableAPM && !APM.module) {
			APM.module = require("com.appcelerator.apm");
			APM.module.init();
		}
	},
	didCrashOnLastAppLoad : function(_error) {
		if (APM.module) {
			return APM.module.didCrashOnLastAppLoad();
		}
		return false;
	},
	setUsername : function(_username) {
		if (APM.module) {
			APM.module.setUsername(_username);
		}
	},
	setOptOutStatus : function(_status) {
		if (APM.module) {
			APM.module.setOptOutStatus(_status);
		}
	},
	setMetadata : function(_key, _value) {
		if (APM.module) {
			APM.module.setMetadata(_key, _value);
		}
	},
	leaveBreadcrumb : function(_breadcrumb) {
		if (APM.module) {
			APM.module.leaveBreadcrumb(_breadcrumb || "");
		}
	},
	logHandledException : function(_error) {
		if (APM.module) {
			APM.module.logHandledException(_error || {});
		}
	}
};

module.exports = APM;
