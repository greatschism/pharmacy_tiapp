var args = arguments[0] || {},
    apiCodes = Alloy.CFG.apiCodes,
    doctor = args.doctor,
    isWindowOpen;

function init() {
	/**
	 * all text fields have same height
	 */
	var height = $.uihelper.getHeightFromChildren($.nameView);
	$.nameVDividerView.height = height;
	$.addressVDividerView.height = height;
	$.locationVDividerView.height = height;
}

function focus() {
	if (!isWindowOpen) {
		isWindowOpen = true;
		var codes = Alloy.Models.states.get("code_values");
		if (codes) {
			updateInputs();
		} else {
			$.http.request({
				method : "codes_get",
				params : {
					feature_code : "THXXX",
					data : [{
						codes : [{
							code_name : apiCodes.code_states
						}]
					}]
				},
				forceRetry : true,
				success : didGetStates
			});
		}
	}
}

function didGetStates(result, passthrough) {
	Alloy.Models.states.set(result.data.codes[0]);
	updateInputs();
}

function didClickName(e) {
	$.uihelper.showDialog({
		message : $.strings.doctorMsgEditRestricted
	});
}

function updateInputs() {
	var codes = Alloy.Models.states.get("code_values");
	$.stateDp.setChoices(codes);
	if (!_.isEmpty(doctor)) {
		if (doctor.doctor_type != apiCodes.doctor_type_manual) {
			/**
			 * editing first or last name
			 * of a doctor created by system
			 * will unlink all it's prescriptions
			 * Note: this is a limitation on server side
			 * so to avoid that we disable the edit here
			 *
			 * Using ucword because name set by server
			 * has all caps
			 */
			$.fnameTxt.applyProperties({
				value : $.utilities.ucword(doctor.first_name),
				editable : false
			});
			$.lnameTxt.applyProperties({
				value : $.utilities.ucword(doctor.last_name),
				editable : false
			});
			$.fnameTxt.getView().addEventListener("click", didClickName);
			$.lnameTxt.getView().addEventListener("click", didClickName);
		} else {
			$.fnameTxt.setValue(doctor.first_name);
			$.lnameTxt.setValue(doctor.last_name);
		}
		$.phoneTxt.setValue($.utilities.formatPhoneNumber(doctor.phone));
		$.faxTxt.setValue($.utilities.formatPhoneNumber(doctor.fax));
		$.addressLine1Txt.setValue(doctor.addressline1);
		$.addressLine2Txt.setValue(doctor.addressline2);
		$.zipTxt.setValue(doctor.zip);
		$.cityTxt.setValue(doctor.city);
		_.some(codes, function(code, index) {
			if (code.code_value == doctor.state) {
				$.stateDp.setSelectedIndex(index);
				return true;
			}
			return false;
		});
		$.notesTxta.setValue(doctor.notes);
	}
}

function setParentView(view) {
	$.stateDp.setParentView(view);
}

function hideAllPopups() {
	return $.stateDp.hide();
}

function moveToNext(e) {
	var nextItem = e.nextItem || false;
	if (nextItem && $[nextItem]) {
		$[nextItem].focus();
	}
}

function didChange(e) {
	var value = $.utilities.formatPhoneNumber(e.value),
	    source = e.source,
	    len = value.length;
	source.setValue(value);
	source.setSelection(len, len);
}

function didClickSubmit(e) {
	if (Ti.App.keyboardVisible) {
		Ti.App.hideKeyboard();
	}
	var fname,
	    lname,
	    phone,
	    fax,
	    state;
	fname = $.fnameTxt.getValue();
	if (!fname) {
		$.uihelper.showDialog({
			message : $.strings.doctorValFirstName
		});
		return;
	}
	if (!$.utilities.validateName(fname)) {
		$.uihelper.showDialog({
			message : $.strings.doctorValFirstNameInvalid
		});
		return;
	}
	lname = $.lnameTxt.getValue();
	if (!lname) {
		$.uihelper.showDialog({
			message : $.strings.doctorValLastName
		});
		return;
	}
	if (!$.utilities.validateName(lname)) {
		$.uihelper.showDialog({
			message : $.strings.doctorValLastNameInvalid
		});
		return;
	}
	phone = $.phoneTxt.getValue();
	if (phone) {
		phone = $.utilities.validatePhoneNumber(phone);
		if (!phone) {
			$.uihelper.showDialog({
				message : $.strings.doctorValPhoneInvalid
			});
			return;
		}
	}
	fax = $.faxTxt.getValue();
	if (fax) {
		fax = $.utilities.validatePhoneNumber(fax);
		if (!fax) {
			$.uihelper.showDialog({
				message : $.strings.doctorValFaxInvalid
			});
			return;
		}
	}
	state = $.stateDp.getSelectedItem();
	/**
	 * keep everything in a
	 * new object until api call
	 * returns success
	 */
	var data = _.pick(doctor, ["id", "doctor_type", "image_url"]);
	_.extend(data, {
		first_name : $.fnameTxt.getValue(),
		last_name : $.lnameTxt.getValue(),
		phone : phone,
		fax : fax,
		addressline1 : $.addressLine1Txt.getValue(),
		addressline2 : $.addressLine2Txt.getValue(),
		zip : $.zipTxt.getValue(),
		city : $.cityTxt.getValue(),
		state : _.isEmpty(state) ? "" : state.code_value,
		notes : $.notesTxta.getValue()
	});
	if (args.isUpdate) {
		_.extend(data, {
			method : "doctors_update",
			shouldUpdate : true
		});
	} else {
		_.extend(data, {
			method : "doctors_add",
			doctor_type : "manual"
		});
	}
	$.http.request({
		method : data.method,
		params : {
			feature_code : "THXXX",
			data : [{
				doctors : _.omit(data, ["method", "shouldUpdate"])
			}]
		},
		passthrough : data,
		success : didSuccessDoctor
	});
}

function didSuccessDoctor(result, passthrough) {
	/**
	 * extend the source object
	 */
	_.extend(doctor, passthrough);
	$.app.navigator.close();
}

function didClickRemove(e) {
	if (doctor.doctor_type != apiCodes.doctor_type_manual) {
		$.uihelper.showDialog({
			message : $.strings.doctorMsgRemoveRestricted
		});
	} else {
		doctor.method = "doctors_delete";
		$.uihelper.showDialog({
			message : String.format($.strings.doctorMsgRemoveConfirm, doctor.title),
			buttonNames : [$.strings.dialogBtnYes, $.strings.dialogBtnNo],
			cancelIndex : 1,
			success : didConfirmRemove
		});
	}
}

function didConfirmRemove() {
	$.http.request({
		method : doctor.method,
		params : {
			feature_code : "THXXX",
			data : [{
				doctors : {
					id : doctor.id
				}
			}]
		},
		success : didRemoveDoctor
	});
}

function didRemoveDoctor(result, passthrough) {
	$.app.navigator.closeToRoot();
}

exports.init = init;
exports.focus = focus;
exports.setParentView = setParentView;
exports.backButtonHandler = hideAllPopups;
