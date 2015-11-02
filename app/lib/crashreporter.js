var Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    utilities = require("utilities"),
    CrashReporterModule = false;

var Reporter = {
	init : function(callback, appId, config) {
		if (Alloy.CFG.crashreporter_enabled && !CrashReporterModule) {
			var Module = require("com.appcelerator.apm"),
			    didServiceready = function() {
				CrashReporterModule = Module;
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
		if (CrashReporterModule) {
			return CrashReporterModule.didCrashOnLastAppLoad();
		}
		return false;
	},
	setUsername : function(username) {
		if (CrashReporterModule) {
			CrashReporterModule.setUsername(username);
		}
	},
	getUUID : function() {
		if (CrashReporterModule) {
			return CrashReporterModule.getUUID();
		}
		return false;
	},
	setOptOutStatus : function(status) {
		if (CrashReporterModule) {
			CrashReporterModule.setOptOutStatus(status);
		}
	},
	setMetadata : function(key, value) {
		if (CrashReporterModule) {
			CrashReporterModule.setMetadata(key, value);
		}
	},
	leaveBreadcrumb : function(breadcrumb) {
		if (CrashReporterModule) {
			CrashReporterModule.leaveBreadcrumb(breadcrumb);
		}
	},
	logHandledException : function(error) {
		if (CrashReporterModule && utilities.isError(error)) {
			CrashReporterModule.logHandledException(error);
			return true;
		}
		return false;
	}
};

module.exports = Reporter;
