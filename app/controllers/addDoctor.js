var args = arguments[0] || {},
    app = require("core"),
    dialog = require("dialog"),
    utilities = require("utilities"),
    http = require("requestwrapper"),
    strings = Alloy.Globals.strings,
    nameRegExp = /^[A-Za-z0-9]{3,40}$/,
    zipRegExp = /^[0-9]{5}([0-9]{4})?$/,
    doctor,
    fname,
    lname,
    faxNo,
    hospitalDetails,
    streetDetails,
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
	hospitalDetails = $.hospitalTxt.getValue();
	streetDetails = $.streetTxt.getValue();
	cityDetails = $.cityTxt.getValue();
	stateDetails = $.stateTxt.getSelectedItem().code_values;
	zipCode = $.zipTxt.getValue();
	notes = $.notesTxta.getValue();
	console.log(stateDetails);
	var errorMessage = "",
	    allFieldsValidated = true;

	if (fname == "" || fname == null) {
		errorMessage = "Please enter your first name";
		allFieldsValidated = false;

	} else if (lname == "" || lname == null) {
		errorMessage = "Please enter your last name";
		allFieldsValidated = false;

	} else if (!nameRegExp.test(fname)) {
		errorMessage = "Please enter a valid First name";
		allFieldsValidated = false;

	} else if (!nameRegExp.test(lname)) {
		errorMessage = "Please enter a valid Last name";
		allFieldsValidated = false;

	} else if (phoneNo && !(utilities.validateMobileNumber($.phoneTxt.getValue()))) {
		errorMessage = "Please enter a valid phone number";
		allFieldsValidated = false;

	} else if (faxNo && !(utilities.validateMobileNumber($.faxTxt.getValue()))) {
		errorMessage = "Please enter a valid fax number";
		allFieldsValidated = false;

	} else if (zipCode.length && !zipRegExp.test(zipCode)) {
		errorMessage = "Please enter a valid zip code";
		allFieldsValidated = false;

	}

	if (!allFieldsValidated) {
		dialog.show({
			message : errorMessage
		});
	} else {

		fname = firstToUpperCase(fname);
		lname = firstToUpperCase(lname);

		if (args.edit == "false") {
			http.request({
				method : "DOCTORS_ADD",
				data : {
					filter : [{
						type : ""
					}],
					data : {
						"doctors" : {
							"doctor_dea" : "12345",
							"first_name" : fname,
							"last_name" : lname,
							"addressline1" : hospitalDetails,
							"addressline2" : streetDetails,
							"state" : stateDetails || "",
							"city" : cityDetails,
							"zip" : zipCode,
							"notes" : notes,
							"phone" : phoneNo,
							"fax" : faxNo,
							"image_url" : "",
							"org_name" : "MSCRIPTS",
							"optional" : ""
						}
					}
				},
				success : didSuccessCreate
			});

		} else {
			http.request({
				method : "DOCTORS_UPDATE",
				data : {
					filter : [{
						type : ""
					}],
					data : {
						"doctors" : {
							"id" : doctor.id,
							"doctor_dea" : "12345",
							"first_name" : fname,
							"last_name" : lname,
							"addressline1" : hospitalDetails,
							"addressline2" : streetDetails,
							"state" : stateDetails || "",
							"city" : cityDetails,
							"zip" : zipCode,
							"notes" : notes,
							"phone" : phoneNo,
							"fax" : faxNo,
							"image_url" : "",
							"org_name" : "MSCRIPTS",
							"optional" : ""
						}
					}
				},
				success : didSuccessUpdate
			});

		}//

	}
}

function didSuccessCreate(_result) {

	Alloy.Models.doctor.set({
		doctor_add : {
			"id" : _result.doctor_id,
			"doctor_dea" : "12345",
			"first_name" : fname,
			"last_name" : lname,
			"addressline1" : hospitalDetails,
			"addressline2" : streetDetails,
			"state" : stateDetails || "",
			"city" : cityDetails,
			"zip" : zipCode,
			"notes" : notes,
			"phone" : phoneNo,
			"fax" : faxNo,
			"image_url" : "",
			"org_name" : "MSCRIPTS",
			"optional" : ""
		}
	});

	dialog.show({
		message : Alloy.Globals.strings.msgDoctorAdded,
		buttonNames : [Alloy.Globals.strings.strOK],
		success : function() {
			app.navigator.closeToRoot();
		}
	});

}

function didSuccessUpdate(_result) {
	Alloy.Models.doctor.set({
		doctor_update : {
			"id" : args.doctor.id,
			"doctor_dea" : "12345",
			"first_name" : fname,
			"last_name" : lname,
			"addressline1" : hospitalDetails,
			"addressline2" : streetDetails,
			"state" : stateDetails || "",
			"city" : cityDetails,
			"zip" : zipCode,
			"notes" : notes,
			"phone" : phoneNo,
			"fax" : faxNo,
			"image_url" : "",
			"org_name" : "MSCRIPTS",
			"optional" : ""
		}
	});

	dialog.show({
		message : Alloy.Globals.strings.msgDoctorUpdated,
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

function didLoadStates(_result) {

	var stateList = _result.data.code_values;

	$.stateTxt.setChoices(stateList);

	if (args.edit == "true") {

		doctor = args.doctor;

		$.fnameTxt.setValue(doctor.first_name);
		$.lnameTxt.setValue(doctor.last_name);
		$.phoneTxt.setValue(doctor.phone);
		$.faxTxt.setValue(doctor.fax);
		$.hospitalTxt.setValue(doctor.addressline1);
		$.streetTxt.setValue(doctor.addressline2);
		$.cityTxt.setValue(doctor.city);

		/*console.log(stateList);
		 console.log(doctor.state);
		 state = _.findWhere(stateList, {
		 code_values : doctor.state
		 });

		 console.log(state);*/
		if (doctor.state) {
			var position = stateList.map(function(eachState) {//get index of the state
				return eachState.code_values;
			}).indexOf(doctor.state);
			console.log(position);
			$.stateTxt.setSelectedIndex(position);
		}
		$.zipTxt.setValue(doctor.zip);
		$.notesTxta.setValue(doctor.notes);

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
		method : "STATES_GET",
		success : didLoadStates
	});

}

function firstToUpperCase(str) {
	return str.substr(0, 1).toUpperCase() + str.substr(1).toLowerCase();
}

function setParentViews(_view) {

	$.stateTxt.setParentView(_view);
}

exports.init = init;
exports.setParentViews = setParentViews;

