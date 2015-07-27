var args = arguments[0] || {},
    utilities = require("utilities");

//reload tss of this controller in memory
require("config").updateTSS($.__controllerPath);

function didChange(e) {
	var value = utilities.formatRx(e.value),
	    len = value.length;
	$.txt.setValue(value);
	$.txt.setSelection(len, len);
}

function didClick(e) {
	$.trigger("click", e);
}

function setRightIcon(iconText, iconDict) {
	$.txt.setIcon(iconText, "right", iconDict);
}

exports.getValue = $.txt.getValue;
exports.setRightIcon = setRightIcon;
