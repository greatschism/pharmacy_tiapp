var args = $.args,
moment = require("alloy/moment");
    
function init(e) {
	$.searchExistingPatientLbl.text = $.strings.searchExistingPatientLbl;
}

function focus(e) {
	
}

function setParentView(view) {
	$.dob.setParentView(view);
}

function moveToNext(e) {
	var nextItem = e.nextItem || "";
	if (nextItem && $[nextItem]) {
		!$[nextItem].apiName && $[nextItem].focus ? $[nextItem].focus() : didClickContinue();
	} else {
		didClickContinue();
	}
}

function didChangePhone(e) {
	var value = $.utilities.formatPhoneNumber(e.value),
	    len = value.length;
	$.moNumberTxt.setValue(value);
	$.moNumberTxt.setSelection(len, len);
}

function didClickContinue(e) {
	var mobileNumber = $.moNumberTxt.getValue(),
		dob = $.dob.getValue();
	mobileNumber = $.utilities.validatePhoneNumber(mobileNumber);
	if (!mobileNumber) {
		$.uihelper.showDialog({
			message : $.strings.phoneValPhoneInvalid
		});
		return;
	}
	if (!dob) {
		uihelper.showDialog({
			message : Alloy.Globals.strings.registerValDob
		});
		return;
	}
	/**
	 * If the user is <18, stop him from registration. He shall contact the support for assistance
	 */
	if (moment().diff(dob, "years", true) < 18) {
		uihelper.showDialog({
			message : String.format(Alloy.Globals.strings.msgAgeRestriction, Alloy.Models.appload.get("supportphone")),
		});
		return;
	}

	var patient_info = {
		dob : dob,
		mobile_number : mobileNumber
	};
	
	$.http.request({
		method : "patient_search",
		params : {
			data : [{
				patient : {
					mobile : "1" + mobileNumber,
  					birth_date: moment(dob).format(Alloy.CFG.apiCodes.dob_format)
				}
			}]

		},
		success : didSuccess,
		failure : didFailed,
		passthrough : patient_info
	});

}

function didFailed(result, passthrough){
	
}

function didSuccess(result, passthrough) {
	var searchResult = result.data.patients,
	record_count = parseInt(searchResult.record_count);
	_.extend(searchResult, passthrough);
	if(record_count === 1) {
		checkUserType(searchResult);
	} else if (record_count === 0 || record_count > 1) {
		$.app.navigator.open({
			ctrl : "signup",
			titleid : "titleCreateAccount",
			ctrlArguments : searchResult,
			stack : false
		});
	}
}

function checkUserType(e){
	if (parseInt(e.is_migrated_user) === 0 && parseInt(e.is_store_user) === 0 && parseInt(e.dispensing_account_exists) === 1) {
		$.app.navigator.open({
			titleid : "titleLogin",
			ctrl : "login",
		});
	} else if (parseInt(e.is_migrated_user) === 1 || parseInt(e.is_store_user) === 1 || parseInt(e.dispensing_account_exists) === 1) {
		$.app.navigator.open({
			ctrl : "signupExistingUser",
			titleid : "titleCreateAccount",
			ctrlArguments : e,
			stack : false
		});
	} else {
		$.app.navigator.open({
			ctrl : "signup",
			titleid : "titleCreateAccount",
			ctrlArguments : e,
			stack : false
		});
	}
}

exports.init = init;
exports.setParentView = setParentView;
exports.focus = focus;
