var args = arguments[0] || {};
var uname = $.unameTxt.getvalue();
var password = $.passwordTooltip.getvalue();
var email = $.emailTxt.getvalue();
var dateOfbirth = $.dob.getvalue();
var token = true,
    errorMessage = "";

function didClickCreate(e) {
	if (validate()) {
		// Continue with the API call
		http.request({
			method : "PATIENTS_", // This value is defined in config.json
			forceRetry : false,
			data : {
				data : {
					patient : {
						user_name : uname,
						email_address : email,
						password : password
					}
				},
				success : didGetResponse
			}
		});
	} else {
		alert(errorMessage);
	}
}

function validate() {

	var re = /[0-9]/;
	var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
	if (uname === "") {
		token = false;
		errorMessage = "Please enter username";
	} else if (dateOfBirth === "") {
		token = false,
		errorMessage = "username cannot be blank";
	} else if (password === "") {
		token = false,
		errorMessage = "Please enter a password";
	} else if (length(password) < 6 && re.test(password) === false) {
		token = false,
		errorMessage = "Please enter a valid password";
	} else if (email === "") {
		token = false,
		errorMessage = "Please enter an email ID";
	} else if (reg.test(email) === false) {
		token = false,
		errorMessage = "Please enter a valid email ID";
	}
	return (token);
}

function didGetResponse(result){
	alert("The account has been created");
	// Go to Login screen closeToRoot
	app.navigator.closeToRoot();
}

function didToggle(e) {
	$.passwordTxt.setPasswordMask(e.value);
}

function didFocusPassword(e) {
	$.passwordView.zIndex = 2;
	$.passwordTooltip.show();
}

function didBlurPassword(e) {
	$.passwordTooltip.hide(function() {
		$.passwordView.zIndex = 0;
	});
}

function moveToNext(e) {
	var nextItem = e.nextItem || "";
	nextItem ? $[nextItem] && $[nextItem].focus() : didClickCreate();
}

function handleScroll(e) {
	$.scrollView.canCancelEvents = e.value;
}
