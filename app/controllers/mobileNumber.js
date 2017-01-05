var args = $.args;

function didClickSkip(e) {
	$.app.navigator.open({
		ctrl : "signup",
		titleid : "titleCreateAccount",
		stack : true
	});
}

function init(e) {
	$.skipAttr.text=$.strings.mobileNumberSkip;
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
					first_name : "",
  					birth_date: ""
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
		$.app.navigator.open({
			ctrl : "signup",
			titleid : "titleCreateAccount",
			ctrlArguments : searchResult,
			stack : true
		});
	} else if(record_count > 1) {
	}
}

function didFail(result, passthrough) {
	
}

exports.init = init;
exports.focus = focus;