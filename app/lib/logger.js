var Alloy = require("alloy"),
    _ = require("alloy/underscore")._,
    scule = require("com.scule"),
    utilities = require("utilities");

var TiLog = {
	/**
	 * scule collection
	 */
	collection : scule.factoryCollection("scule+dummy://logs"),
	//levels
	level : {
		none : -1,
		error : 1,
		warn : 2,
		info : 3,
		debug : 4,
		trace : 5,
		timestamp : 6
	},
	getConfig : function() {
		return TiLog.level[Alloy.CFG.log_level] || -1;
	},
	trace : function() {
		if (TiLog.getConfig() >= TiLog.level.trace) {
			TiLog.collection.save({
				level : "trace",
				value : TiLog.format(arguments, "trace")
			});
		}
	},
	debug : function() {
		if (TiLog.getConfig() >= TiLog.level.debug) {
			TiLog.collection.save({
				level : "debug",
				value : TiLog.format(arguments, "debug")
			});
		}
	},
	info : function() {
		if (TiLog.getConfig() >= TiLog.level.info) {
			TiLog.collection.save({
				level : "info",
				value : TiLog.format(arguments, "info")
			});
		}
	},
	warn : function() {
		if (TiLog.getConfig() >= TiLog.level.warn) {
			TiLog.collection.save({
				level : "warn",
				value : TiLog.format(arguments, "warn")
			});
		}
	},
	error : function() {
		if (TiLog.getConfig() >= TiLog.level.error) {
			TiLog.collection.save({
				level : "error",
				value : TiLog.format(arguments, "error")
			});
		}
	},
	timestamp : function() {
		if (TiLog.getConfig() >= TiLog.level.timestamp) {
			TiLog.collection.save({
				level : "timestamp",
				logged_at : new Date().toString(),
				value : TiLog.format(arguments, "timestamp")
			});
		}
	},
	log : function() {
		var func = TiLog[arguments[0]];
		(func || TiLog.info)(_.toArray(arguments).slice( func ? 1 : 0), func ? arguments[0] : "info");
	},
	format : function(args, level) {
		var str = "";
		try {
			_.each(args, function(val, key) {
				if (str) {
					str += Alloy.CFG.log_separator;
				}
				if (_.isString(val) || _.isNumber(val)) {
					str += val;
				} else if (_.isObject(val)) {
					str += JSON.stringify(val);
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
				} else {
					str += ( typeof val) + " type is unknown";
				}
			});
		} catch(error) {
			str = TiLog.format("Logger", "unable to parse with error", error);
		}
		/**
		 * allow Ti logger
		 * only if environment is
		 * not production
		 */
		if (!ENV_PROD) {
			Ti.API[level](str);
		}
		return str;
	}
};

module.exports = TiLog;
