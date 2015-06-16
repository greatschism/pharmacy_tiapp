var Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    utilities = require("utilities");

var TiLog = {
	level : {
		none : -1,
		error : 1,
		warn : 2,
		info : 3,
		debug : 4,
		trace : 5,
		timestamp : 6
	},
	separator : Alloy.CFG.log_separator || ":",
	getConfig : function() {
		return TiLog.level[Alloy.CFG.log_level] || -1;
	},
	trace : function() {
		if (TiLog.getConfig() >= TiLog.level.trace) {
			Ti.API.trace(TiLog.format(arguments));
		}
	},
	debug : function() {
		if (TiLog.getConfig() >= TiLog.level.debug) {
			Ti.API.debug(TiLog.format(arguments));
		}
	},
	info : function() {
		if (TiLog.getConfig() >= TiLog.level.info) {
			Ti.API.info(TiLog.format(arguments));
		}
	},
	warn : function() {
		if (TiLog.getConfig() >= TiLog.level.warn) {
			Ti.API.warn(TiLog.format(arguments));
		}
	},
	error : function() {
		if (TiLog.getConfig() >= TiLog.level.error) {
			Ti.API.error(TiLog.format(arguments));
		}
	},
	timestamp : function() {
		if (TiLog.getConfig() >= TiLog.level.timestamp) {
			Ti.API.timestamp(TiLog.format(arguments));
		}
	},
	log : function() {
		var func = TiLog[arguments[0]];
		(func || TiLog.info)(_.toArray(arguments).slice( func ? 1 : 0));
	},
	format : function(args) {
		var str = "";
		try {
			_.each(args, function(val, key) {
				if (str) {
					str += TiLog.separator;
				}
				if (_.isString(val)) {
					str += val;
				} else if (_.isArray(val)) {
					str += val.join(" ");
				} else if (utilities.isError(val)) {
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
				} else if (_.isObject(val)) {
					str += JSON.stringify(val, null, 4);
				} else {
					str += ( typeof val) + " type is unknown";
				}
			});
		} catch(error) {
			str = TiLog.format("Logger", "unable to parse with error", error);
		}
		return str;
	}
};

module.exports = TiLog;
