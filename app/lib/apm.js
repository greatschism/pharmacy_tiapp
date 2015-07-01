var Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    utilities = require("utilities"),
    PerformanceModule = false;

var TiPerformance = {
	init : function(callback, appId, config) {
		if (Alloy.CFG.apm_enabled && !PerformanceModule) {
			var Module = require("com.appcelerator.apm"),
			    didServiceready = function() {
				PerformanceModule = Module;
				if (callback) {
					callback(true);
				}
			};
			if (OS_ANDROID) {
				Module.addEventListener("serviceready", didServiceready);
			}
			if (!appId) {
				appId = utilities.getProperty("com-appcelerator-apm-id", "", "string", false);
			}
			Module.init(appId, config || {});
			if (!OS_ANDROID) {
				didServiceready();
			}
		} else {
			if (callback) {
				callback(false);
			}
		}
	},
	didCrashOnLastAppLoad : function() {
		if (PerformanceModule) {
			return PerformanceModule.didCrashOnLastAppLoad();
		}
		return false;
	},
	setUsername : function(username) {
		if (PerformanceModule) {
			PerformanceModule.setUsername(username);
		}
	},
	getUUID : function() {
		if (PerformanceModule) {
			return PerformanceModule.getUUID();
		}
		return false;
	},
	setOptOutStatus : function(status) {
		if (PerformanceModule) {
			PerformanceModule.setOptOutStatus(status);
		}
	},
	setMetadata : function(key, value) {
		if (PerformanceModule) {
			PerformanceModule.setMetadata(key, value);
		}
	},
	leaveBreadcrumb : function(breadcrumb) {
		if (PerformanceModule) {
			PerformanceModule.leaveBreadcrumb(breadcrumb || "");
		}
	},
	logHandledException : function(error) {
		if (PerformanceModule && utilities.isError(error)) {
			PerformanceModule.logHandledException(error);
			return true;
		}
		return false;
	}
};

module.exports = TiPerformance;
