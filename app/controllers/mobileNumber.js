var args = $.args;

function init(e) {
}

function focus(e) {
	
}

function didChangePhone(e) {
	var value = $.utilities.formatPhoneNumber(e.value),
	    len = value.length;
	$.moNumberTxt.setValue(value);
	$.moNumberTxt.setSelection(len, len);
}

function didClickContinue(e) {
	var mobileNumber = $.moNumberTxt.getValue();
	mobileNumber = $.utilities.validatePhoneNumber(mobileNumber);
	if (!mobileNumber) {
		$.uihelper.showDialog({
			message : $.strings.phoneValPhoneInvalid
		});
		return;
	}
	
	 $.http.request({
		method : "patient_search",
		params : {
			data : [{
				patient : {
					mobile : "1" + mobileNumber,
					first_name : null,
  					birth_date: null
				}
			}]

		},
		success : didCheckMobileNumber,
		failure : didFail,
		passthrough : mobileNumber
	});
	 
}

function didCheckMobileNumber(result, passthrough) {
	var searchResult = result.data.patients,
	record_count = parseInt(searchResult.record_count);
	searchResult.mobile_number = passthrough;
	if (record_count === 0) {
		$.app.navigator.open({
			ctrl : "signup",
			titleid : "titleCreateAccount",
			ctrlArguments : searchResult,
			stack : true
		});
	} else if(record_count === 1) {
		isMigratedUser(searchResult);
	} else if(record_count > 1) {
		$.app.navigator.open({
			ctrl : "searchExistingPatient",
			titleid : "titleCreateAccount",
			ctrlArguments : searchResult,
			stack : false
		});
	}
}

function didFail(result, passthrough) {
	
}

function isMigratedUser(e){
	if (parseInt(e.is_migrated_user) === 1 && parseInt(e.dispensing_account_exists) === 1) {
		$.app.navigator.open({
			ctrl : "signupExistingUser",
			titleid : "titleCreateAccount",
			ctrlArguments : e,
			stack : false
		});
	} else if (parseInt(e.is_migrated_user) === 1 && parseInt(e.dispensing_account_exists) === 0){
		$.app.navigator.open({
			ctrl : "signupStoreUser",
			titleid : "titleCreateAccount",
			ctrlArguments : e,
			stack : false
		});
	} else if (parseInt(e.is_migrated_user) === 0){
		isStoreUser(e);
	}
	
}

function isStoreUser(e){
	if (parseInt(e.is_store_user) === 1) {
		$.app.navigator.open({
			ctrl : "signupStoreUser",
			titleid : "titleCreateAccount",
			ctrlArguments : e,
			stack : false
		});
	} else{
		
	};
}

exports.init = init;
exports.focus = focus;