var args = arguments[0] || {},
    app = require("core"),
    dialog = require("dialog"),
    strings = Alloy.Globals.strings,
    nameRegExp = /^[A-Za-z0-9]{3,40}$/,
    phoneNoRegExp = /^[0-9](-)[0-9]{3}(-)[0-9]{3}(-)[0-9]{4}$/,
    faxNoRegExp = /^(\()[0-9]{3}(\))[0-9]{7}$/,
    zipRegExp = /^\\d{5}(-\\d{4})?$/,
    http = require("requestwrapper");

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

	} else if (phoneNo && !phoneNoRegExp.test(phoneNo)) {
		errorMessage = "Please enter a valid phone number";
		allFieldsValidated = false;

	} else if (faxNo && !faxNoRegExp.test(faxNo)) {
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
			method : "ADD_DOCTOR",
			data : {
				filter : [{
					type : ""
				}],
				data : {
					"doctors" : {
						"doctor_dea" : "12345",
						"first_name" :fname,
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

function didSuccess(_result)
{
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

function numVal(e) {
	//  e.source.value = e.source.value.replace(/[^0-9]+/,"");
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

	$.stateTxt.setParentView(view);
}

exports.init = init;
exports.setParentViews = setParentViews;

