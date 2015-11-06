var TAG = "CRRE",
    Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    utilities = require("utilities"),
    Module = require("com.appcelerator.apm"),
    serviceready = false;

var Reporter = {
	init : function(callback, appId, config) {
		if (Alloy.CFG.crashreporter_enabled && !serviceready) {
			var onServiceready = function() {
				require("logger").debug(TAG, "initated");
				serviceready = true;
				if (OS_ANDROID) {
					Module.removeEventListener("serviceready", onServiceready);
				}
				if (callback) {
					callback(true);
				}
			};
			if (OS_ANDROID) {
				Module.addEventListener("serviceready", onServiceready);
			}
			Module.init(utilities.getProperty("com-appcelerator-apm-id", appId, "string", false), config || {});
			if (!OS_ANDROID) {
				onServiceready();
			}
		} else {
			if (callback) {
				callback(false);
			}
		}
	},
	crash : function() {
		require("logger").warn(TAG, "simulated crash");
		if (OS_ANDROID) {
			require("core").navigator.currentController.getView().add({});
		} else {
			Module.crashTheApp();
		}
	},
	didCrashOnLastAppLoad : function() {
		if (serviceready) {
			return Module.didCrashOnLastAppLoad();
		}
		return false;
	},
	setUsername : function(username) {
		if (serviceready) {
			Module.setUsername(username);
		}
	},
	getUUID : function() {
		if (serviceready) {
			return Module.getUUID();
		}
		return false;
	},
	setOptOutStatus : function(status) {
		if (serviceready) {
			Module.setOptOutStatus(status);
		}
	},
	getOptOutStatus : function(status) {
		if (serviceready) {
			return Module.getOptOutStatus(status);
		}
		return false;
	},
	setMetadata : function(key, value) {
		if (serviceready) {
			Module.setMetadata(key, value);
		}
	},
	leaveBreadcrumb : function(breadcrumb) {
		if (serviceready) {
			Module.leaveBreadcrumb(breadcrumb);
		}
	},
	logHandledException : function(error) {
		if (serviceready && utilities.isError(error)) {
			Module.logHandledException(error);
			return true;
		}
		return false;
	}
};

module.exports = Reporter;
