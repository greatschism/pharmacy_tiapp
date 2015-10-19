var args = arguments[0] || {},
    rx = require("rx");

function didChange(e) {
	var value = rx.format(e.value),
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
