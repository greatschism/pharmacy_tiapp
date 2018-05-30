var Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    crashreporter = require("crashreporter");

var TiLog = {
	trace : function() {
		TiLog.log("trace", _.toArray(arguments));
	},
	debug : function() {
		TiLog.log("debug", _.toArray(arguments));
	},
	info : function() {
		TiLog.log("info", _.toArray(arguments));
	},
	warn : function() {
		TiLog.log("warn", _.toArray(arguments));
	},
	error : function() {
		TiLog.log("error", _.toArray(arguments));
	},
	log : function(level, messages) {
		var logStr = messages.join(":");
		crashreporter.leaveBreadcrumb(level + ":" + logStr);
		if (!ENV_PROD) {
			Ti.API[level](logStr);
		}
	}
};

module.exports = TiLog;
