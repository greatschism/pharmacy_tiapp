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
			if (!_appId) {
				_appId = utilities.getProperty("com-appcelerator-apm-id", "", "string", false);
			}
			Module.init(_appId, _config || {});
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
		if (PerformanceModule) {
			return PerformanceModule.getUUID();
		}
		return false;
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
		if (PerformanceModule && (_.isObject(_error) || utilities.isError(_error))) {
			PerformanceModule.logHandledException({
				name : _error.name || "Error",
				message : _error.message || "",
				line : _error.lineNumber || ""
			});
			return true;
		}
		return false;
	}
};

module.exports = TiPerformance;
