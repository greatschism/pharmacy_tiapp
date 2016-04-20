var args = $.args,
    refillScan = require("refillScan");

function init() {
	var lastPhone = $.utilities.getProperty(Alloy.CFG.latest_phone_used);
	if (lastPhone) {
		didChange({
			value : lastPhone
		});
	}
}

function didChange(e) {
	var value = $.utilities.formatPhoneNumber(e.value),
	    len = value.length;
	$.phoneTxt.setValue(value);
	$.phoneTxt.setSelection(len, len);
}

function didClickSubmit(e) {
	var phone = $.phoneTxt.getValue();
	if (!phone) {
		$.uihelper.showDialog({
			message : $.strings.refillPhoneValPhone
		});
		return;
	}
	phone = $.utilities.validatePhoneNumber(phone);
	if (!phone) {
		$.uihelper.showDialog({
			message : $.strings.refillPhoneValPhoneInvalid
		});
		return;
	}
	refillScan.init($, phone);
}

exports.init = init;
