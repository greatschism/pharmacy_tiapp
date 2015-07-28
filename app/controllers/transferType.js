var args = arguments[0] || {},
    isWindowOpen;
function focus() {
	if (!isWindowOpen) {
		isWindowOpen = true;
		if (Alloy.Models.storeOriginal.get("code_values")) {
			updateInputs();
		} else {
			$.http.request({
				method : "codes_get",
				params : {
					feature_code : "THXXX",
					data : [{
						codes : [{
							code_name : Alloy.CFG.apiCodes.code_store_original
						}]
					}]
				},
				forceRetry : true,
				success : didGetStoreOriginal
			});
		}
	}
}

function didGetStoreOriginal(result, passthrough) {
	Alloy.Models.storeOriginal.set(result.data.codes[0]);
	updateInputs();
}

function updateInputs() {
	$.storeOriginalDp.setChoices(Alloy.Models.storeOriginal.get("code_values"));
	/**
	 * args.edit - should be true in order to
	 * populate the values
	 */
	if (args.edit) {
		var prescription = args.prescription;
		$.nameTxt.setValue(prescription.name);
		$.rxTxt.setValue(prescription.rx);
		$.phoneTxt.setValue($.utilities.formatPhoneNumber(prescription.phone));
		$.storeOriginalDp.setSelectedItem(prescription.storeOriginal);
	}
}

function moveToNext(e) {
	var nextItem = e.nextItem || false;
	if (nextItem && $[nextItem]) {
		$[nextItem].focus();
	}
}

function didChangePhone(e) {
	var value = $.utilities.formatPhoneNumber(e.value),
	    len = value.length;
	$.phoneTxt.setValue(value);
	$.phoneTxt.setSelection(len, len);
}

function didClickSubmit(e) {
	var name,
	    phone,
	    storeOriginal;
	name = $.nameTxt.getValue();
	if (!name) {
		$.uihelper.showDialog({
			message : $.strings.transferTypeValName
		});
		return;
	}
	var prescname = $.utilities.validatePrescriptionName(name);
	if (!prescname) {
		$.uihelper.showDialog({
			message : $.strings.transferTypeValNameInvalid
		});
		return;
	}
	/**
	 * skipping rx validation
	 * no validation required for rx
	 * as it is from different store chain
	 */
	phone = $.phoneTxt.getValue();
	if (!phone) {
		$.uihelper.showDialog({
			message : $.strings.transferTypeValPhone
		});
		return;
	}
	phone = $.utilities.validatePhoneNumber(phone);
	if (!phone) {
		$.uihelper.showDialog({
			message : $.strings.transferTypeValPhoneInvalid
		});
		return;
	}
	storeOriginal = $.storeOriginalDp.getSelectedItem();
	if (_.isEmpty(storeOriginal)) {
		$.uihelper.showDialog({
			message : $.strings.transferTypeValStoreOriginal
		});
		return;
	}
	/**
	 * if args.edit is true
	 * then just close this page
	 * as it would be a reques from review
	 * details screen
	 */
	var prescription = {
		name : name,
		rx : $.rxTxt.getValue(),
		phone : phone,
		storeOriginal : storeOriginal
	};
	
	if (args.edit) {
		_.extend(args.prescription, prescription);
		$.app.navigator.close();
	} else {
		if (Alloy.Globals.isLoggedIn) {
			$.app.navigator.open({
				titleid : "titleTransferStore",
				ctrl : "stores",
				ctrlArguments : {
					prescription : prescription,
					navigation : {
						titleid : "titleTransferOptions",
						ctrl : "transferOptions",
						ctrlArguments : {
							prescription : prescription,
							store : {}
						},
						stack : true
					},
					selectable : true
				},
				stack : true
			});
		} else {
			$.app.navigator.open({
				titleid : "titleTransferUserDetails",
				ctrl : "transferUserDetails",
				ctrlArguments : {
					prescription : prescription
				},
				stack : true
			});
		}
	}
}

function setParentView(view) {
	$.storeOriginalDp.setParentView(view);
}

function hideAllPopups() {
	return $.storeOriginalDp.hide();
}

exports.focus = focus;
exports.setParentView = setParentView;
exports.backButtonHandler = hideAllPopups;
