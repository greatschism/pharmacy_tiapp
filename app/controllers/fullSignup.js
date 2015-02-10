var args = arguments[0] || {},
    app = require("core"),
    locationFirstUpdate = true;

function init() {
	Alloy.Models.store.on("change", updateStore);
}

function setParentViews(view) {
	$.dob.setParentView(view);
}

function didClickSignup(e) {

	// app.navigator.open({
	// titleid : "titleVerifyMobileNumber",
	// ctrl : "textToApp",
	// stack : true
	// });

	var fname = $.fnameTxt.getValue(),
	    lname = $.lnameTxt.getValue(),
	    dob = $.dob.getValue(),
	    email = $.emailTxt.getValue(),
	    username = $.unameTxt.getValue(),
	    password = $.passwordTxt.getValue(),
	    rxNumber = $.rxNoTxt.getValue(),
	    storeAddressLine1 = $.locationLbl.getValue();

	var errorMessage = "",
	    allFieldsValidated = true;

	if (fname === "") {

	} else if (lname === "") {

	} else if (dob) {
		
	}

	http.request({
		method : "PATIENTS_REGISTER",
		data : {
			request : {
				authenticate : {
					username : uname,
					password : password,
					clientname : Alloy.CFG.clientname,
					emailpin : Alloy.CFG.emailpin,
					featurecode : "TH053",
					language : ""
				}
			}
		},
		success : didAuthenticate
	});

	dialog.show({
		message : Alloy.Globals.strings.valLoginRequiredFileds
	});

}

function didToggle(e) {
	$.passwordTxt.setPasswordMask(e.value);
}

function didFocusPassword(e) {
	$.passwordTooltip.show();
}

function didBlurPassword(e) {
	$.passwordTooltip.hide();
}

function moveToNext(e) {
	var nextItem = e.nextItem || "";
	if (nextItem == "pharmacy" && locationFirstUpdate) {
		choosePharmacy();
	} else {
		$[nextItem] ? $[nextItem].focus() : didClickSignup();
	}
}

function handleScroll(e) {
	$.scrollView.canCancelEvents = e.value;
}

function choosePharmacy(e) {
	app.navigator.open({
		titleid : "titleStores",
		ctrl : "stores",
		ctrlArguments : {
			orgin : "fullSignup"
		},
		stack : true
	});
}

function updateStore() {
	if (locationFirstUpdate) {
		locationFirstUpdate = false;
		$.locationLbl.color = Alloy._fg_denary;
	}
	$.locationLbl.text = Alloy.Models.store.get("addressline1");
}

function didClickTermsAndCondition() {

	app.navigator.open({
		ctrl : "termsAndConditions",
		titleid : "titleTermsAndConditions",
		stack : true
	});

}

function terminate() {
	Alloy.Models.store.off("change", updateStore);
}

exports.init = init;
exports.terminate = terminate;
exports.setParentViews = setParentViews;
