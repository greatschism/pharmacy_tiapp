var Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    utilities = require("utilities"),
    PerformanceModule = false;

var TiPerformance = {
	init : function(_callback, _appId, _config) {
		if (Alloy.CFG.APM_ENABLED && !PerformanceModule) {
			var Module = require("com.appcelerator.apm"),
			    didServiceready = function() {
				PerformanceModule = Module;
				if (_.isFunction(_callback)) {
					_callback(true);
				}
			};
			if (OS_ANDROID) {
				Module.addEventListener("serviceready", didServiceready);
			}
			Module.init(_appId || utilities.getProperty("com-appcelerator-apm-id", "", "string", false), _config || {});
			if (!OS_ANDROID) {
				didServiceready();
			}
		} else {
			if (_.isFunction(_callback)) {
				_callback(false);
			}
		}
	},
	didCrashOnLastAppLoad : function() {
		if (PerformanceModule) {
			return PerformanceModule.didCrashOnLastAppLoad();
		}
		return false;
	},
	setUsername : function(_username) {
		if (PerformanceModule) {
			PerformanceModule.setUsername(_username);
		}
	},
	getUUID : function() {
		if (OS_ANDROID && PerformanceModule) {
			PerformanceModule.getUUID();
		}
		return "";
	},
	setOptOutStatus : function(_status) {
		if (PerformanceModule) {
			PerformanceModule.setOptOutStatus(_status);
		}
	},
	setMetadata : function(_key, _value) {
		if (PerformanceModule) {
			PerformanceModule.setMetadata(_key, _value);
		}
	},
	leaveBreadcrumb : function(_breadcrumb) {
		if (PerformanceModule) {
			PerformanceModule.leaveBreadcrumb(_breadcrumb || "");
		}
	},
	logHandledException : function(_error) {
		if (PerformanceModule && utilities.isError(_error)) {
			PerformanceModule.logHandledException(_error);
			return true;
		}
		return false;
	}
};

module.exports = TiPerformance;
