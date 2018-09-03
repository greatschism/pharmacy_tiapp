var args = $.args,
    apiCodes = Alloy.CFG.apiCodes,
    doctor = args.doctor,
    isWindowOpen,
    keyboardModule = require("com.mscripts.hidekeyboard");

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
		message : $.strings.doctorSettingsMsgEditRestricted
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
	if (Ti.App.keyboardVisible || keyboardModule.getKeyboardVisible()) {
		keyboardModule.hideKeyboard();
	}
	var fname,
	    lname,
	    phone,
	    fax,
	    state;
	fname = $.fnameTxt.getValue();
	if (!fname) {
		$.uihelper.showDialog({
			message : $.strings.doctorSettingsValFirstName
		});
		return;
	}
	if (!$.utilities.validateName(fname)) {
		$.uihelper.showDialog({
			message : $.strings.doctorSettingsValFirstNameInvalid
		});
		return;
	}
	lname = $.lnameTxt.getValue();
	if (!lname) {
		$.uihelper.showDialog({
			message : $.strings.doctorSettingsValLastName
		});
		return;
	}
	if (!$.utilities.validateName(lname)) {
		$.uihelper.showDialog({
			message : $.strings.doctorSettingsValLastNameInvalid
		});
		return;
	}
	phone = $.phoneTxt.getValue();
	if (phone) {
		phone = $.utilities.validatePhoneNumber(phone);
		if (!phone) {
			$.uihelper.showDialog({
				message : $.strings.doctorSettingsValPhoneInvalid
			});
			return;
		}
	}
	fax = $.faxTxt.getValue();
	if (fax) {
		fax = $.utilities.validatePhoneNumber(fax);
		if (!fax) {
			$.uihelper.showDialog({
				message : $.strings.doctorSettingsValFaxInvalid
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
	var data = _.pick(doctor, ["id", "doctor_type", "doctor_dea", "image_url"]);
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
			doctor_type : apiCodes.doctor_type_manual
		});
	}
	$.http.request({
		method : data.method,
		params : {
			data : [{
				doctors : _.omit(data, ["method", "shouldUpdate"])
			}]
		},
		passthrough : data,
		success : didSuccessDoctor
	});
	if (doctor.doctor_type != apiCodes.doctor_type_manual) {
		/**
		 *
		 * APP-222: This is a temporary fix to track the usage of
		 * people who are trying to edit a doctor created by system
		 */
		$.analyticsHandler.trackEvent("Doctors-DoctorSettings-SystemDoctor", "click", "SaveBtn");
		$.analyticsHandler.trackScreen("Doctors-DoctorSettings-SystemDoctor");
	}
}

function didSuccessDoctor(result, passthrough) {
	/**
	 * add doctor id if not available
	 * happens while add
	 */
	if (!doctor.id) {
		doctor.id = result.data.doctors.id;
	}
	/**
	 * extend the source object
	 */
	_.extend(doctor, passthrough);
	$.app.navigator.close();
}

function didClickRemove(e) {
	if (doctor.doctor_type != apiCodes.doctor_type_manual) {
		$.uihelper.showDialog({
			message : $.strings.doctorSettingsMsgRemoveRestricted
		});
	} else {
		$.uihelper.showDialog({
			message : String.format($.strings.doctorSettingsMsgRemoveConfirm, doctor.title),
			buttonNames : [$.strings.dialogBtnYes, $.strings.dialogBtnNo],
			cancelIndex : 1,
			success : didConfirmRemove
		});
	}
}

function didConfirmRemove() {
	$.http.request({
		method : "doctors_delete",
		params : {
			data : [{
				doctors : {
					id : doctor.id
				}
			}]
		},
		success : didDeleteDoctor
	});
}

function didDeleteDoctor(result, passthrough) {
	/**
	 * to update list,
	 * doing this before success may be a issue on failure api calls
	 */
	doctor.method = "doctors_delete";
	//close
	$.app.navigator.open(Alloy.Collections.menuItems.findWhere({
		landing_page : true
	}).toJSON());
}

exports.init = init;
exports.focus = focus;
exports.setParentView = setParentView;
exports.backButtonHandler = hideAllPopups;
