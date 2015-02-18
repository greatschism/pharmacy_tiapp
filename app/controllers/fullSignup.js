var args = arguments[0] || {},
    app = require("core"),
    locationFirstUpdate = true,
    dialog = require("dialog"),
    moment = require('alloy/moment'),
    uihelper = require("uihelper"),
    http=require("requestwrapper"),
    fname,
    lname,
    dob,
    email,
    username,
    password,
    rxNumber,
    storeAddressLine1,
    nameRegExp = /^[A-Za-z0-9]{3,20}$/,
    emailRegExp = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i,
    usernameRegExpNos = /^[0-9]+$/,
    userNameRegExp = /^[A-Za-z0-9]{3,20}$/,
    passwordRegExp = /^(?=(.*\d){2})(?=.*[a-zA-Z])[0-9a-zA-Z]{6,}$/,
    rxnoRegExp = /[0-9]{7}/;

uihelper.getImage($.logoImage);
moment().format('MM-DD-YYYY');

var styleToolTip = {

	classes : ["text-center", "arrow-down"],
	height : 80,
	width : Ti.UI.FILL,
	bottom : 10,
	backgroundColor : "#6D6E71",
	color : "#ffffff",
	zIndex : 2
};

var passwordTooltip = Alloy.createWidget("com.mscripts.tooltip", "widget", styleToolTip);
passwordTooltip.setText(Alloy.Globals.strings.msgPasswordTips);

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
	
	fname = $.fnameTxt.getValue();
    lname = $.lnameTxt.getValue();
    dob = $.dob.getValue();
    email = $.emailTxt.getValue();
    username = $.unameTxt.getValue();
    password = $.passwordTxt.getValue();
    rxNumber = $.rxNoTxt.getValue();
    storeAddressLine1 = $.locationLbl.getValue();

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
		errorMessage = "Please enter a valid username";
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
			
			console.log("111");

			dialog.show({
				message : Alloy.Globals.strings.msgAgePopUp,
				buttonNames : [Alloy.Globals.strings.btnIAgree, Alloy.Globals.strings.strCancel],
				cancelIndex : 1,
				success : didSuccess
			});

		} else {
			console.log("111");
			didSuccess();

		}

		
	}
}

function didSuccess() {
	http.request({
		method : "PATIENTS_REGISTER",
		data : {
			request : {
				authenticate : {
					username : username,
					password : password,
					clientname : Alloy.CFG.clientname,
					emailpin : Alloy.CFG.emailpin,
					featurecode : "TH053",
					language : ""
				}
			}
		},
		success : didCreateAccount
	});
	
}

function didToggle(e) {
	$.passwordTxt.setPasswordMask(e.value);
}

function didFocusPassword(e) {
	//console.log("1111");
	//$.passwordTxt.add(passwordTooltip.getView());
	//console.log("2222");
	//passwordTooltip.show();
//	console.log("333");
}

function didBlurPassword(e) {
	//passwordTooltip.hide();
}

function didFocusUsername(e) {
	//usernameTooltip.show();
}

function didBlurUsername(e) {
	//usernameTooltip.hide();
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

function didCreateAccount(result)
{
	
	console.log("333");
	dialog.show({
				title:"Success",
				message : result.message,
				buttonNames : [Alloy.Globals.strings.strOK],
				success : goToLogin
			});
	
}

function goToLogin()
{
	console.log("444");
	
	app.navigator.closeToRoot(function() {
		app.navigator.open({
		ctrl : "login",
		titleid : "Login",
		stack : true
	});
	});
}

exports.init = init;
exports.terminate = terminate;
exports.setParentViews = setParentViews;
