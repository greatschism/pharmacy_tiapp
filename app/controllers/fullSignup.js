var args = arguments[0] || {},
    app = require("core"),
    locationFirstUpdate = true,
    dialog = require("dialog"),
    moment = require('alloy/moment');

moment().format('MM-DD-YYYY');

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
	    storeAddressLine1 = $.locationLbl.getValue(),
	    nameRegExp = /^[A-Za-z0-9]{3,20}$/,
	    emailRegExp = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i,
	    usernameRegExpNos = /^[0-9]+$/,
	    userNameRegExp = /^[A-Za-z0-9]{3,20}$/,
	    passwordRegExp = /^(?=(.*\d){2})(?=.*[a-zA-Z])[0-9a-zA-Z]{6,}$/,
	    rxnoRegExp = /[0-9]{7}/;

	var errorMessage = "",
	    allFieldsValidated = true;

	if (fname == "" || fname == null) {
		errorMessage = "Please enter your first name";
		allFieldsValidated = false;

	} else if (lname == "" || lname == null) {
		errorMessage = "Please enter your last name";
		allFieldsValidated = false;

	} else if (dob == "" || dob == null) {
		errorMessage = "Please enter the date of birth";
		allFieldsValidated = false;

	} else if (email == "" || email == null) {
		errorMessage = "Please enter the email address";
		allFieldsValidated = false;

	} else if (username == "" || username == null) {
		errorMessage = "Please enter the username ";
		allFieldsValidated = false;

	} else if (password == "" || password == null) {
		errorMessage = "Please enter the password ";
		allFieldsValidated = false;

	} else if (rxNumber == "" || rxNumber == null) {
		errorMessage = "Please enter the Rx number";
		allFieldsValidated = false;

	} else if (password == "" || password == null) {
		errorMessage = "Please enter the password ";
		allFieldsValidated = false;

	} else if (!nameRegExp.test(fname)) {
		errorMessage = "Please enter a valid First name";
		allFieldsValidated = false;

	} else if (!nameRegExp.test(lname)) {
		errorMessage = "Please enter a valid Last name";
		allFieldsValidated = false;

	} else if (!emailRegExp.test(email)) {
		errorMessage = "Please enter a valid email address";
		allFieldsValidated = false;

	} else if (usernameRegExpNos.test(username)) {
		errorMessage = "Please enter a valid usernam";
		allFieldsValidated = false;

	} else if (!userNameRegExp.test(username)) {
		errorMessage = "Please enter a valid username";
		allFieldsValidated = false;

	} else if (!passwordRegExp.test(password)) {
		errorMessage = "Please enter a valid password";
		allFieldsValidated = false;

	} else if (!rxnoRegExp.test(rxNumber)) {
		errorMessage = "Please enter a valid prescription number, it is the first 7 digits on your prescription bottle";
		allFieldsValidated = false;

	}

	if (!allFieldsValidated)
		alert(errorMessage);
	
else {

		if (moment().diff(dob, 'years') < 18) {

			console.log("!!!");
			dialog.show({
				message : Alloy.Globals.strings.msgAgePopUp,
				buttonNames : [Alloy.Globals.strings.btnIAgree, Alloy.Globals.strings.strCancel],
				cancelIndex : 1,
				success : didSuccess
			});

			console.log("!!!1111");

		} else {
			alert("age<17");

		}

		/* dialog.show({
		 message : Alloy.Globals.strings.valLoginRequiredFileds
		 });*/
	}
}

function didSuccess() {
	/*http.request({
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
	 });*/
	alert("Success callback");
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

/*function getAge(birth) {

 var today = new Date();
 var nowYear = today.getFullYear();
 var nowMonth = today.getMonth();
 var nowDay = today.getDate();

 var components = birth.split("-");
 var birthYear = components[2];
 var birthMonth = components[0];
 var birthDay = components[1];

 var age = nowYear - birthYear;
 var ageMonth = nowMonth - birthMonth;
 var ageDay = nowDay - birthDay;

 if (ageMonth < 0 || (ageMonth == 0 && ageDay < 0)) {
 age = parseInt(age) - 1;
 }
 alert(age);

 if (age < 18) {
 return 0;
 } else {
 return 1;
 }

 }*/

exports.init = init;
exports.terminate = terminate;
exports.setParentViews = setParentViews; 