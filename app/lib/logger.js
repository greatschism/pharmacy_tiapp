var Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    utilities = require("utilities");

var TiLog = {
	LOG_LEVEL_NONE : -1,
	LOG_LEVEL_ERROR : 0,
	LOG_LEVEL_WARNING : 1,
	LOG_LEVEL_INFO : 2,
	LOG_LEVEL_DEBUG : 3,
	LOG_LEVEL_TRACE : 4,
	getConfig : function() {
		return TiLog["LOG_LEVEL_" + Alloy.CFG.LOG_LEVEL];
	},
	trace : function() {
		if (TiLog.getConfig() >= TiLog.LOG_LEVEL_TRACE) {
			Ti.API.trace(TiLog.format(arguments));
		}
	},
	debug : function() {
		if (TiLog.getConfig() >= TiLog.LOG_LEVEL_DEBUG) {
			Ti.API.debug(TiLog.format(arguments));
		}
	},
	info : function() {
		if (TiLog.getConfig() >= TiLog.LOG_LEVEL_INFO) {
			Ti.API.info(TiLog.format(arguments));
		}
	},
	warn : function() {
		if (TiLog.getConfig() >= TiLog.LOG_LEVEL_WARNING) {
			Ti.API.warn(TiLog.format(arguments));
		}
	},
	error : function() {
		if (TiLog.getConfig() >= TiLog.LOG_LEVEL_ERROR) {
			Ti.API.error(TiLog.format(arguments));
		}
	},
	timestamp : function() {
		if (TiLog.getConfig() >= TiLog.LOG_LEVEL_ERROR) {
			Ti.API.timestamp(TiLog.format(arguments));
		}
	},
	log : function() {
		var func = TiLog[arguments[0]];
		(func || TiLog.info)(_.toArray(arguments).slice( func ? 1 : 0));
	},
	format : function(arguments) {
		var str = "";
		try {
			for (var i in arguments) {
				if (_.isString(arguments[i])) {
					str += arguments[i];
				} else if (_.isArray(arguments[i])) {
					str += arguments[i].join(" ");
				} else if (utilities.isError(arguments[i])) {
					str += "{Errror:{";
					if (_.has(error, "name")) {
						str += "name: " + error.name;
					}
					if (_.has(error, "message")) {
						str += " message: " + error.message;
					}
					if (_.has(error, "lineNumber")) {
						str += "lineNumber: " + error.lineNumber;
					}
					str += "}}";
				} else if (_.isObject(arguments[i])) {
					str += JSON.stringify(arguments[i]);
				}
			}
		} catch(error) {
			str = "Logger: unable to parse with message " + (utilities.isError(error) ? error.message : "none");
		}
		return str;
	}
};

module.exports = TiLog;
