var args = arguments[0] || {},
    apiCodes = Alloy.CFG.apiCodes,
    barcode,
    phone;

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
	require("barcode").capture($, {
		acceptedFormats : Alloy.CFG.accepted_barcode_formats,
		success : didGetBarcode
	});
}

function didGetBarcode(e) {
	barcode = e.result;
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
					pickup_mode : apiCodes.pickup_mode_instore,
					pickup_time_group : apiCodes.pickup_time_group_asap,
					barcode_data : barcode
				}]
			}]
		},
		success : didRefill
	});
}

function didRefill(result, passthrough) {
	/**
	 *  will have only one prescription for scan
	 */
	var prescription = result.data.prescriptions[0],
	    navigation;
	_.extend(prescription, {
		title : $.strings.strPrefixRx.concat(barcode.substring(Alloy.CFG.rx_start_index, Alloy.CFG.rx_end_index)),
		subtitle : prescription.refill_inline_message || prescription.refill_error_message
	});
	if (prescription.refill_is_error === true) {
		//failure
		navigation = {
			titleid : "titleRefillFailure",
			ctrl : "refillFailure",
			ctrlArguments : {
				phone : phone
			}
		};
	} else {
		//success
		navigation = {
			ctrl : "refillSuccess",
			ctrlArguments : {
				prescriptions : [prescription],
				phone : phone
			}
		};
	}
	$.app.navigator.open(navigation);
}

exports.init = init;
