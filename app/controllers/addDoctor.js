var args = arguments[0] || {},
    app = require("core"),
    uihelper = require("uihelper"),
    utilities = require("utilities"),
    http = require("requestwrapper"),
    strings = Alloy.Globals.strings,
    zipRegExp = /^[0-9]{5}([0-9]{4})?$/,
    doctor,
    fname,
    lname,
    faxNo,
    addressLine1,
    addressLine2,
    zipCode,
    notes,
    states = [];

function moveToNext(e) {
	var nextItem = e.nextItem || "";
	$[nextItem] && $[nextItem].focus();
}

function didClickSave(e) {
	fname = $.fnameTxt.getValue();
	lname = $.lnameTxt.getValue();
	phoneNo = $.phoneTxt.getValue();
	faxNo = $.faxTxt.getValue();
	addressLine1 = $.addressLine1.getValue();
	addressLine2 = $.addressLine2.getValue();
	cityDetails = $.cityTxt.getValue();
	stateDetails = $.stateTxt.getSelectedItem().code_values;
	zipCode = $.zipTxt.getValue();
	notes = $.notesTxta.getValue();

	var allFieldsValidated = true;

	if (fname == "" || fname == null) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.valFirstNameRequired
		});
		allFieldsValidated = false;

	} else if (lname == "" || lname == null) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.valLastNameRequired
		});
		allFieldsValidated = false;

	} else if (!utilities.validateName(fname)) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.msgFirstNameTips
		});
		allFieldsValidated = false;

	} else if (!utilities.validateName(lname)) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.msgLastNameTips
		});
		allFieldsValidated = false;

	} else if (phoneNo && phoneNo.length < 10) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.valMobileNumberRequired
		});
		allFieldsValidated = false;

	} else if (faxNo && faxNo.length < 10) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.valFaxNumberRequired
		});
		allFieldsValidated = false;

	} else if (zipCode.length && !zipRegExp.test(zipCode)) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.valZipCode
		});
		allFieldsValidated = false;

	}

	if (allFieldsValidated) {

		if (args.edit == "false") {
			http.request({
				method : "doctors_add",
				data : {
					filter : [{
						type : ""
					}],
					data : [{
						doctors : {
							id : "12345",
							first_name : fname,
							last_name : lname,
							addressline1 : addressLine1,
							addressline2 : addressLine2,
							state : stateDetails || "",
							city : cityDetails,
							zip : zipCode,
							notes : notes,
							phone : phoneNo,
							fax : faxNo,
							image_url : "",
							org_name : "MSCRIPTS",
							optional : "",
							doctor_type : "manual"
						}
					}]
				},
				success : didSuccessCreate
			});

		} else {
			http.request({
				method : "doctors_update",
				data : {
					data : [{
						doctors : {
							id : doctor.id,
							first_name : fname,
							last_name : lname,
							addressline1 : addressLine1,
							addressline2 : addressLine2,
							state : stateDetails || "",
							city : cityDetails,
							zip : zipCode,
							notes : notes,
							phone : phoneNo,
							fax : faxNo,
							image_url : "",
							org_name : "MSCRIPTS",
							optional : "",
							doctor_type : doctor.manually_added
						}
					}]
				},
				success : didSuccessUpdate
			});

		}//

	}
}

function didSuccessCreate(result) {

	Alloy.Models.doctor.set({
		doctor_add : {
			//id : require("alloy/moment")().unix(),
			first_name : fname,
			last_name : lname,
			addressline1 : addressLine1,
			addressline2 : addressLine2,
			state : stateDetails || "",
			city : cityDetails,
			zip : zipCode,
			notes : notes,
			phone : phoneNo,
			fax : faxNo,
			image_url : "",
			org_name : "MSCRIPTS",
			optional : "",
			doctor_type : "manual"
		}
	});

	uihelper.showDialog({
		message : Alloy.Globals.strings.msgDoctorAdded,
		buttonNames : [Alloy.Globals.strings.strOK],
		success : function() {
			app.navigator.closeToRoot();
		}
	});

}

function didSuccessUpdate(result) {

	Alloy.Models.doctor.set({
		doctor_update : {
			id : doctor.id,
			first_name : fname,
			last_name : lname,
			addressline1 : addressLine1,
			addressline2 : addressLine2,
			state : stateDetails || "",
			city : cityDetails,
			zip : zipCode,
			notes : notes,
			phone : phoneNo,
			fax : faxNo,
			image_url : "",
			org_name : "MSCRIPTS",
			optional : "",
			doctor_type : doctor.manually_added
		}
	});

	uihelper.showDialog({
		message : "Doctor update successfully",
		buttonNames : [Alloy.Globals.strings.strOK],
		success : function() {
			app.navigator.close();
		}
	});

}

function didClickRemove() {

	http.request({
		method : "doctors_remove",
		data : {
			filter : [{
				type : ""
			}],
			data : {
				doctors : {
					id : doctor.id
				}
			}

		},
		success : didSuccessRemove
	});
}

function didSuccessRemove(result) {
	Alloy.Models.doctor.set({
		doctor_remove : {
			"id" : doctor.id
		}
	});

	uihelper.showDialog({
		message : Alloy.Globals.strings.msgDoctorDeleted,
		buttonNames : [Alloy.Globals.strings.strOK],
		success : function() {
			app.navigator.closeToRoot();
		}
	});

}

function userVal(e) {
	// var nameRegex = /^[a-zA-Z\-]+$/;
	// var validfirstUsername = $.fnameTxt.value.replace(/^[a-zA-Z\-]+$/);
	// var validfirstUsername = $.fnameTxt.value.match(nameRegex);
	// if(validfirstUsername == null){
	// alert("Your first name is not valid. Only characters A-Z, a-z and '-' are  acceptable.");
	// $.fnameTxt.focus();
	// return false;
	// }

}

function phoneNumberValidate(e) {
	var value = utilities.formatMobileNumber(e.value),
	    len = value.length;
	$.phoneTxt.setValue(value);
	$.phoneTxt.setSelection(len, len);

}

function faxNumberValidate(e) {
	var value = utilities.formatMobileNumber(e.value),
	    len = value.length;
	$.faxTxt.setValue(value);
	$.faxTxt.setSelection(len, len);

}

function didStateChange(e) {
	//	locale.setLanguage($.stateTxt.getSelectedItem().code);
	//	Alloy.Collections.menuItems.trigger("reset");
	//	app.navigator.open({
	//		titleid : "titleHome",
	//		ctrl : "home"
	//	});
}

function didLoadStates(result) {

	var stateList = result.data.code_values;

	$.stateTxt.setChoices(stateList);

	if (args.edit == "true") {

		doctor = args.doctor;
		$.lnameTxt.applyProperties({
			"editable" : "false"
		});

		$.fnameTxt.setValue(doctor.first_name);
		$.lnameTxt.setValue(doctor.last_name);
		$.phoneTxt.setValue(doctor.phone);
		$.faxTxt.setValue(doctor.fax);
		$.addressLine1.setValue(doctor.addressline1);
		$.addressLine2.setValue(doctor.addressline2);
		$.cityTxt.setValue(doctor.city);

		if (doctor.state) {
			var position = stateList.map(function(eachState) {//get index of the state
				return eachState.code_values;
			}).indexOf(doctor.state);

			$.stateTxt.setSelectedIndex(position);
		}
		$.zipTxt.setValue(doctor.zip);
		$.notesTxta.setValue(doctor.notes);

	} else {
		$.removeBtn.hide();
	}
}

function init() {
	// var templates = [],
	// lngs = [],
	// i = 0,
	// selectedIndex = 0;
	// _.each(Alloy.Globals.homePageTemplates, function(obj) {
	// var template = _.pick(obj, ["title"]);
	// template.index = i;
	// templates.push(template);
	// i++;
	// });
	//
	// i = 0;
	// _.each(languages, function(obj) {
	// var lng = _.pick(obj, ["titleid", "code"]);
	// _.extend(lng, {
	// title : lngStrs[lng.titleid]
	// });
	// lngs.push(lng);
	// if (obj.selected) {
	// selectedIndex = i;
	// }
	// i++;
	// });
	// $.stateTxt.setChoices(lngs);
	// $.stateTxt.setSelectedIndex(selectedIndex);

	http.request({
		method : "states_get",
		success : didLoadStates
	});

}

function firstToUpperCase(str) {
	return str.substr(0, 1).toUpperCase() + str.substr(1).toLowerCase();
}

function setParentViews(view) {

	$.stateTxt.setParentView(view);
}

exports.init = init;
exports.setParentViews = setParentViews;

