var Alloy = require("alloy");

var Logger = {
	t : function(_message) {
		if (Alloy.CFG.enableLogger) {
			Ti.API.trace(_message);
		}
	},
	d : function(_message) {
		if (Alloy.CFG.enableLogger) {
			Ti.API.debug(_message);
		}
	},
	i : function(_message) {
		if (Alloy.CFG.enableLogger) {
			Ti.API.info(_message);
		}
	},
	w : function(_message) {
		if (Alloy.CFG.enableLogger) {
			Ti.API.warn(_message);
		}
	},
	e : function(_message) {
		if (Alloy.CFG.enableLogger) {
			Ti.API.error(_message);
		}
	},
	log : function(_level, _message) {
		if (Alloy.CFG.enableLogger) {
			Ti.API.log(_level || "info", _message);
		}
	},
	timestamp : function(_message) {
		if (Alloy.CFG.enableLogger) {
			Ti.API.timestamp(_message);
		}
	}
};

module.exports = Logger;
