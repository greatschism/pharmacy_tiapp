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
    notes;

function moveToNext(e) {
	var nextItem = e.nextItem || "";
	$[nextItem] && $[nextItem].focus();
}

function didClickSave(e) {
	fname = $.fnameTxt.getValue();
	lname = $.lnameTxt.getValue();
	phoneNo = $.phoneTxt.getValue();
	faxNo = $.faxTxt.getValue();
	hospitalDetails = $.hospitalTxt.getValue() ;
	streetDetails = $.streetTxt.getValue() ;
	cityDetails = $.cityTxt.getValue();
	stateDetails = $.stateTxt.getSelectedItem();
	zipCode = $.zipTxt.getValue();
	notes = $.notesTxta.getValue();

	console.log(zipCode);
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
		
		
		if(args.edit=="false")
		{http.request({
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
			success : didSuccessCreate
		});

	}
	else{
		http.request({
			method : "DOCTORS_UPDATE",
			data : {
				filter : [{
					type : ""
				}],
				data : {
					"doctors" : {
						"id":doctor.id,
						"doctor_dea" : "12345",
						"first_name" : fname,
						"last_name" : lname,
						"addressline1" : hospitalDetails,
						"addressline2" : streetDetails,
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
			success : didSuccessUpdate
		});
		
	}//

}}

function didSuccessCreate(_result) {
	

	Alloy.Models.doctor.set({
		doctor_add: {
						"id":_result.doctor_id,
						"doctor_dea" : "12345",
						"first_name" : fname,
						"last_name" : lname,
						"addressline1" : hospitalDetails,
						"addressline2" : streetDetails,
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
		doctor_update: {
						"id":args.doctor.id,
						"doctor_dea" : "12345",
						"first_name" : fname,
						"last_name" : lname,
						"addressline1" : hospitalDetails,
						"addressline2" : streetDetails,
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
	var states = [{
		title : "AL",
		id:"1"
	}, {
		title : "AK",
		id:"2"
	}, {
		title : "AZ",
		id:"3"
	}, {
		title : "AR",
		id:"4"
	}, {
		title : "CA",
		id:"5"
	}, {
		title : "CO",
		id:"6"
	}, {
		title : "CT",
		id:"7"
	}, {
		title : "DE",
		id:"8"
	}, {
		title : "FL",
		id:"9"
	}, {
		title : "GA",
		id:"10"
	}, {
		title : "HI",
		id:"11"
	}, {
		title : "ID",
		id:"12"
	}, {
		title : "IL",
		id:"13"
	}, {
		title : "IN",
		id:"14"
	}, {
		title : "IA",
		id:"15"
	}, {
		title : "KS",
		id:"16"
	}, {
		title : "KY",
		id:"17"
	}, {
		title : "LA",
		id:"18"
	}, {
		title : "ME",
		id:"19"
	}, {
		title : "MD",
		id:"20"
	}, {
		title : "MA",
		id:"21"
	}, {
		title : "MI",
		id:"22"
	}, {
		title : "MN",
		id:"23"
	}, {
		title : "MS",
		id:"24"
	}, {
		title : "MO",
		id:"25"
	}, {
		title : "MT",
		id:"26"
	}, {
		title : "NE",
		id:"27"
	}, {
		title : "NV",
		id:"28"
	}, {
		title : "NH",
		id:"29"
	}, {
		title : "NJ",
		id:"30"
	}, {
		title : "NM",
		id:"31"
	}, {
		title : "NY",
		id:"32"
	}, {
		title : "NC",
		id:"33"
	}, {
		title : "ND",
		id:"34"
	}, {
		title : "OH",
		id:"35"
	}, {
		title : "OK",
		id:"36"
	}, {
		title : "OR",
		id:"37"
	}, {
		title : "PA",
		id:"38"
	}, {
		title : "RI",
		id:"39"
	}, {
		title : "SC",
		id:"40"
	}, {
		title : "SD",
		id:"41"
	}, {
		title : "TN",
		id:"42"
	}, {
		title : "TX",
		id:"43"
	}, {
		title : "UT",
		id:"44"
	}, {
		title : "VT",
		id:"45"
	}, {
		title : "VA",
		id:"46"
	}, {
		title : "WA",
		id:"47"
	}, {
		title : "WV",
		id:"48"
	}, {
		title : "WI",
		id:"49"
	}, {
		title : "WY",
		id:"50"
	}];
	$.stateTxt.setChoices(states);
	
	if (args.edit == "true") {

		doctor = args.doctor;

		$.fnameTxt.setValue(doctor.first_name);
		$.lnameTxt.setValue(doctor.last_name);
		$.phoneTxt.setValue(doctor.phone);
		$.faxTxt.setValue(doctor.fax);
		$.hospitalTxt.setValue(doctor.addressline1);
		$.streetTxt.setValue(doctor.addressline2);
		$.cityTxt.setValue(doctor.city);
		
		state = _.findWhere(states, {
				title : doctor.state
			});
		if(state)
		$.stateTxt.setSelectedIndex(parseInt(state.id)-1);	
		
		$.zipTxt.setValue(doctor.zip);
		$.notesTxta.setValue(doctor.notes);
	
	}  
}

function setParentViews(_view) {

	$.stateTxt.setParentView(_view);
}

exports.init = init;
exports.setParentViews = setParentViews;

