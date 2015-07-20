var args = arguments[0] || {};

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

function didClickContinue(e) {
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
	if (args.type == Alloy.CFG.apiCodes.refill_type_scan) {
		//scan
	} else {
		//type rx
	}
}

exports.init = init;
