var args = arguments[0] || {},
    app = require("core"),
    http = require("requestwrapper"),
    utilities = require("utilities"),
    token = true,
    errorMessage = "";
    $.dob.setValue(args.birthday);

function didClickCreate(e) {
	
	var email = $.emailTxt.getValue(),
	    dateOfBirth = $.dob.getValue(),
	    uname = $.unameTxt.getValue(),
	    password = $.passwordTxt.getValue(),
	// regExEmail = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i,
	// regExPassword = /^(?=(.*\d){2})(?=.*[a-zA-Z])[0-9a-zA-Z]{6,}$/,
	    blnValidated = true;
	errorMessage = "";

	if (email !== null && email === "") {
		blnValidated = false;
		errorMessage = "Please enter an email ID";
	} else if (utilities.validateEmailFormat(email) === false) {
		blnValidated = false;
		errorMessage = "Please enter a valid email ID";
	} else if (dateOfBirth !== null && dateOfBirth === "") {
		blnValidated = false;
		errorMessage = "Please enter a date of birth";
	} else if (uname !== null && uname === "") {
		blnValidated = false;
		errorMessage = "Please enter a username";
	} else if (password !== null && password === "") {
		blnValidated = false;
		errorMessage = "Please enter a password";
	} else if (utilities.validatePasswordFormat(password) === false) {
		blnValidated = false;
		errorMessage = "Please enter a valid password. Passwords need to have at least 2 numbers and be at least 6 characters long.";
	}

	if (blnValidated) {
		http.request({
			method : "PATIENTS_STORE_TO_APP_CONVERSION",
			data : {
				client_identifier : "x",
				version : "x",
				session_id : "x",
				filter : [{
					type : "mobile_otp"
				}],
				data : [{
					patient : {
						user_name : uname,
						email_address : email,
						password : password
					}
				}]
			},
			success : didCreateAccountSuccess,
		});
	} else {
		alert(errorMessage);
	}
}

function didCreateAccountSuccess(result) {
	alert("Your account has been created");

	app.navigator.closeToRoot(function() {
		app.navigator.open(function() {
			dialog.show({
				message : "Your account has been created"
			});
		});
	});

	// console.log(result.data);
	// app.navigator.open({
	// ctrl : "login",
	// titleid : "",
	// stack : true
	// });

}

function didToggle(e) {
	$.passwordTxt.setPasswordMask(e.value);
	console.log(args.birthday);
}

function didFocusPassword(e) {
	//$.passwordView.zIndex = 2;
	$.passwordTooltip.show();
}

function didBlurPassword(e) {
	$.passwordTooltip.hide(function() {
		//$.passwordView.zIndex = 0;
	});
}

function moveToNext(e) {
	var nextItem = e.nextItem || "";
	nextItem ? $[nextItem] && $[nextItem].focus() : didClickCreate();
}

function handleScroll(e) {
	$.scrollView.canCancelEvents = e.value;
}