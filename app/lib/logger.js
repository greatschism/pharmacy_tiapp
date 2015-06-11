var Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    utilities = require("utilities");

var TiLog = {
	none : -1,
	error : 0,
	warn : 1,
	info : 2,
	debug : 3,
	trace : 4,
	separator : ":",
	getConfig : function() {
		return TiLog[Alloy.CFG.log_level];
	},
	trace : function() {
		if (TiLog.getConfig() >= TiLog.trace) {
			Ti.API.trace(TiLog.format(arguments));
		}
	},
	debug : function() {
		if (TiLog.getConfig() >= TiLog.debug) {
			Ti.API.debug(TiLog.format(arguments));
		}
	},
	info : function() {
		if (TiLog.getConfig() >= TiLog.info) {
			Ti.API.info(TiLog.format(arguments));
		}
	},
	warn : function() {
		if (TiLog.getConfig() >= TiLog.warn) {
			Ti.API.warn(TiLog.format(arguments));
		}
	},
	error : function() {
		if (TiLog.getConfig() >= TiLog.error) {
			Ti.API.error(TiLog.format(arguments));
		}
	},
	timestamp : function() {
		if (TiLog.getConfig() >= TiLog.error) {
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
