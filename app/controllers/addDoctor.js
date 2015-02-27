var args = arguments[0] || {},
    app = require("core"),
    dialog = require("dialog"),
    utilities = require("utilities"),
    http = require("requestwrapper"),
    strings = Alloy.Globals.strings,
    nameRegExp = /^[A-Za-z0-9]{3,40}$/,
    zipRegExp = /^\\d{5}(-\\d{4})?$/,
    doctor;

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
	streetDetaisl = $.streetTxt.getValue();
	cityDetails = $.cityTxt.getValue();
	stateDetails = $.stateTxt.getSelectedItem();
	zipCode = $.zipTxt.getValue();
	notes = $.notesTxta.getValue();

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

	} else if (zipCode && !zipRegExp.test(zipCode)) {
		errorMessage = "Please enter a valid zip code";
		allFieldsValidated = false;

	}

	if (!allFieldsValidated) {
		dialog.show({
			message : errorMessage
		});
	} else {
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
						"addressline1" : "TEST",
						"addressline2" : "TEST",
						"state" : stateDetails,
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
			success : didSuccess
		});

	}//

}

function didSuccess(_result) {
	dialog.show({
		message : Alloy.Globals.strings.msgDoctorAdded,
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

function init() {

	if (args.edit == "true") {

		doctor = args.doctor;

		$.fnameTxt.setValue(doctor.first_name);
		$.lnameTxt.setValue(doctor.last_name);
		$.phoneTxt.setValue(doctor.phone);
		$.faxTxt.setValue(doctor.fax);
		$.hospitalTxt.setValue(doctor.addressline1);
		$.streetTxt.setValue(doctor.addressline2);
		$.cityTxt.setValue(doctor.city);
		//$.stateTxt.setValue(doctor.stateTxt.getSelectedItem();
		$.zipTxt.setValue(doctor.zip);
		$.notesTxta.setValue(doctor.notes);
	
	}
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
	var states = [{
		title : "AL"
	}, {
		title : "AK"
	}, {
		title : "AZ"
	}, {
		title : "AR"
	}, {
		title : "CA"
	}, {
		title : "CO"
	}, {
		title : "CT"
	}, {
		title : "DE"
	}, {
		title : "FL"
	}, {
		title : "GA"
	}, {
		title : "HI"
	}, {
		title : "ID"
	}, {
		title : "IL"
	}, {
		title : "IN"
	}, {
		title : "IA"
	}, {
		title : "KS"
	}, {
		title : "KY"
	}, {
		title : "LA"
	}, {
		title : "ME"
	}, {
		title : "MD"
	}, {
		title : "MA"
	}, {
		title : "MI"
	}, {
		title : "MN"
	}, {
		title : "MS"
	}, {
		title : "MO"
	}, {
		title : "MT"
	}, {
		title : "NE"
	}, {
		title : "NV"
	}, {
		title : "NH"
	}, {
		title : "NJ"
	}, {
		title : "NM"
	}, {
		title : "NY"
	}, {
		title : "NC"
	}, {
		title : "ND"
	}, {
		title : "OH"
	}, {
		title : "OK"
	}, {
		title : "OR"
	}, {
		title : "PA"
	}, {
		title : "RI"
	}, {
		title : "SC"
	}, {
		title : "SD"
	}, {
		title : "TN"
	}, {
		title : "TX"
	}, {
		title : "UT"
	}, {
		title : "VT"
	}, {
		title : "VA"
	}, {
		title : "WA"
	}, {
		title : "WV"
	}, {
		title : "WI"
	}, {
		title : "WY"
	}];
	$.stateTxt.setChoices(states);
}

function setParentViews(_view) {

	$.stateTxt.setParentView(_view);
}

exports.init = init;
exports.setParentViews = setParentViews;

