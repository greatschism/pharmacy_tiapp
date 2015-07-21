var args = arguments[0] || {},
    phone = "";

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
	phone = $.phoneTxt.getValue();
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
		require("barcode").capture({
			$ : $,
			acceptedFormats : Alloy.CFG.accepted_barcode_formats,
			success : didGetBarcode
		});
	} else {
		$.app.navigator.open({
			titleid : "titleRefillQuick",
			ctrl : "refillQuick",
			ctrlArguments : {
				phone : phone
			}
		});
	}
}

function didGetBarcode(e) {
	$.http.request({
		method : "prescriptions_refill",
		params : {
			feature_code : "THXXX",
			filter : {
				refill_type : apiCodes.refill_type_scan
			},
			data : [{
				prescriptions : [{
					mobile_number : phone,
					pickup_mode : Alloy.CFG.apiCodes.pickup_mode_instore,
					pickup_time_group : apiCodes.pickup_time_group_asap,
					barcode_data : e.result
				}]
			}]
		},
		success : didRefill,
		failure : didFail
	});
}

function didRefill(result, passthrough) {
	$.app.navigator.open({
		titleid : "titleRefillSuccess",
		ctrl : "refillSuccess",
		ctrlArguments : {
			prescriptions : result.data.prescriptions
		}
	});
}

function didFail(result, passthrough) {
	$.app.navigator.open({
		titleid : "titleRefillFailure",
		ctrl : "refillFailure"
	});
}

exports.init = init;
