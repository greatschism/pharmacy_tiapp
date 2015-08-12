var moment = require("alloy/moment");
function init() {
	$.uihelper.getImage("logo", $.logoImg);
}

function focus() {
	$.vDividerView.height = $.uihelper.getHeightFromChildren($.txtView);
}

function didClickContinue() {
	var fname = $.fnameTxt.getValue(),
	    lname = $.lnameTxt.getValue(),
	    password = $.passwordTxt.getValue(),
	    email = $.emailTxt.getValue(),
	    dobValue = $.dobDp.getValue(),
	    dob = moment(dobValue).format(Alloy.CFG.apiCodes.date_format);
	if (!fname) {
		$.uihelper.showDialog({
			message : $.strings.mgrAccountCreationValFirstName
		});
		return;
	}
	if (!$.utilities.validateName(fname)) {
		$.uihelper.showDialog({
			message : $.strings.mgrAccountCreationValFirstNameInvalid
		});
		return;
	}
	if (!lname) {
		$.uihelper.showDialog({
			message : $.strings.mgrAccountCreationValLastName
		});
		return;
	}
	if (!$.utilities.validateName(lname)) {
		$.uihelper.showDialog({
			message : $.strings.mgrAccountCreationValLastNameInvalid
		});
		return;
	}
	if (!dobValue) {
		$.uihelper.showDialog({
			message : $.strings.mgrAccountCreationValDob
		});
		return;
	}
	if (!password) {
		$.uihelper.showDialog({
			message : $.strings.mgrAccountCreationValPasssword
		});
		return;
	}
	if (!email) {
		$.uihelper.showDialog({
			message : $.strings.mgrAccountCreationValEmail
		});
		return;
	}
	if (!$.utilities.validateEmail(email)) {
		$.uihelper.showDialog({
			message : $.strings.mgrAccountCreationValEmailInvalid
		});
		return;
	}
	$.http.request({
	 method : "patient_register",
	 params : {
	 feature_code : "THXXX",
	 filter : {
	 sort_order : "asc"
	 },
	 data : [{
	 patient : {
	 user_name : email,
	 password : password,
	 first_name : fname,
	 last_name : lname,
	 birth_date : dob,
	 gender : "",
	 address_line1 : "",
	 address_line2 : "",
	 city : "",
	 state : "",
	 zip : "",
	 home_phone : "",
	 mobile : "",
	 email_address : email,
	 rx_number : "",
	 store_id : "",
	 user_type : "PARTIAL",
	 optional : [{
	 key : "",
	 value : ""
	 }, {
	 key : "",
	 value : ""
	 }]
	 }
	 }]

	 },
	 success : didRegister,
	 failure: didFail
	 });
}

function didFail() {
	$.app.navigator.open({
		titleid : "titleMgrAccountExists",
		ctrl : "mgrAccountExists",
		stack : true
	});
}

function didRegister(result,passthrough) {
	successMessage = result.message;
	$.uihelper.showDialog({
		message : successMessage
	});
	$.app.navigator.open({
		titleid : "titleChildAdd",
		ctrl : "childAdd",
		ctrlArguments : {
			username : $.emailTxt.getValue(),
			password : $.passwordTxt.getValue(),
		},
		stack : true
	});
}

function moveToNext(e) {
	var nextItem = e.nextItem || false;
	if (nextItem && $[nextItem]) {
		$[nextItem].focus();
	}
}

function setParentView(view) {
	$.dobDp.setParentView(view);
}

function didClickAgreement(e) {
	$.app.navigator.open({
		ctrl : "termsAndConditions",
		titleid : "titleTermsAndConditions",
		stack : true,
		ctrlArguments : {
			registrationFlow : true
		}
	});
}

exports.setParentView = setParentView;
exports.focus = focus;
exports.init=init;
