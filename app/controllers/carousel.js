var args = arguments[0] || {},
    app = require("core"),
    uihelper = require("uihelper"),
    utilities = require("utilities");

function init() {
	utilities.setProperty(Alloy.CFG.first_launch, false, "bool", false);
}

exports.init = init;
