var args = arguments[0] || {},
    apiCodes = Alloy.CFG.apiCodes;

function init() {
	getOriginalPharmacies();
}

function getOriginalPharmacies() {
	$.http.request({
		method : "codes_get",
		params : {
			feature_code : "THXXX",
			data : [{
				codes : [{
					code_name : apiCodes.code_original_pharmacy
				}]
			}]
		},
		success : didGetOriginalPharmacies,

	});

}

function didGetOriginalPharmacies(result) {
	Alloy.Models.originalPharmacies.set(result.data.codes[0]);
	var codes = Alloy.Models.originalPharmacies.get("code_values"),
	    defaultVal = Alloy.Models.originalPharmacies.get("default_value");
	_.each(codes, function(code) {
		if (code.code_value === defaultVal) {
			Alloy.Models.originalPharmacies.set("selected_code_value", code.code_value);
			code.selected = true;
		} else {
			code.selected = false;
		}
	});
	console.log(codes);

}

function didChange(e) {
	var value = $.utilities.formatPhoneNumber(e.value),
	    len = value.length;
	$.phoneNumberTxt.setValue(value);
	$.phoneNumberTxt.setSelection(len, len);
}

function didClickNext() {
	var prescName = $.prescNameTxt.getValue(),
	    phoneNumber = $.phoneNumberTxt.getValue();
	if (!prescName) {
		$.uihelper.showDialog({
			message : $.strings.transferRxTypePrescValPrescName
		});
		return;
	}
	if (!phoneNumber) {
		$.uihelper.showDialog({
			message : $.strings.transferRxTypePrescValPhone
		});
		return;
	}
	phoneNumber = $.utilities.validatePhoneNumber(phoneNumber);
	if (!phoneNumber) {
		$.uihelper.showDialog({
			message : $.strings.transferRxTypePrescValPhoneInvalid
		});
		return;
	}
	
	
}

function moveToNext(e) {
	var nextItem = e.nextItem || false;
	if (nextItem && $[nextItem]) {
		$[nextItem].focus();
	}
}

exports.init = init;

