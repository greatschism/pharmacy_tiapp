var args = $.args,
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
	 * args.prescription - is valid
	 * this is a edit
	 * populate the values
	 */
	var prescription = args.prescription;
	if (prescription) {
		$.nameTxt.setValue(prescription.name);
		$.rxTxt.setValue(prescription.rx);
		$.phoneTxt.setValue($.utilities.formatPhoneNumber(prescription.phone));
		if (prescription.storeOriginal.code_display == "Other") {
			$.otherTxt = Alloy.createWidget("ti.textfield", "widget", $.createStyle({
				classes : ["form-txt"],
				hintText : $.strings.transferTypeOther,
				analyticsId : "OtherTxt"
			}));
			$.otherTxtView.add($.otherTxt.getView());
			$.otherTxt.setValue(prescription.storeOther);
			$.storeOriginalDp.setSelectedItem(prescription.storeOriginal);

		} else {
			$.storeOriginalDp.setSelectedItem(prescription.storeOriginal);
		}
	}
}

function didChangeStore() {
	if ($.storeOriginalDp.getSelectedItem().code_display === "Other") {
		if ($.otherTxtView.getChildren().length === 0) {
			$.otherTxt = Alloy.createWidget("ti.textfield", "widget", $.createStyle({
				classes : ["form-txt"],
				hintText : $.strings.transferTypeOther,
				analyticsId : "OtherTxt"
			}));
			$.otherTxtView.add($.otherTxt.getView());			
		}
	} else if ($.otherTxt) {
		if ($.otherTxtView.getChildren().length !== 0)
			$.otherTxtView.remove($.otherTxt.getView());
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
	if (!$.utilities.validatePrescriptionName(name)) {
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
	if (storeOriginal.code_display == "Other") {
		storeOtherValue = $.otherTxt.getValue();
	} else {
		storeOtherValue = "";
	}
	/**
	 * if args.prescription is valid
	 * then just close this page
	 * as it would be a request from review
	 * details screen
	 */
	var prescription = {
		name : name,
		rx : $.rxTxt.getValue(),
		phone : phone,
		storeOriginal : storeOriginal,
		storeOther :storeOtherValue
	};
	if (args.prescription) {
		_.extend(args.prescription, prescription);
		$.app.navigator.close();
	} else {
		if (Alloy.Globals.isLoggedIn) {
			$.app.navigator.open({
				titleid : "titleTransferStore",
				ctrl : "stores",
				ctrlArguments : {
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
