var args = arguments[0] || {},
app = require("core"),
http = require("requestwrapper");

var token = true,
    errorMessage = "";

function didClickCreate(e) {
		var email = $.emailTxt.getValue();
	var uname = $.unameTxt.getValue();
	var password = $.passwordTxt.getValue();
	
	http.request({
			method : "PATIENTS_STORE_TO_APP_CONVERSION",
			data:  {

 client_identifier: "x",

 version: "x",
 session_id: "x",

 filter: [{
  type:"mobile_otp"

 }],

 data: [{

  patient: {
   user_name:uname,
   email_address:email,
password:password

  }

 }]

},
success : didSuccess,
})
}
	function didSuccess(result) {
	console.log("ACCOUNT CREATED");
	alert("Your account has been created");
	
	console.log(result.data);
	app.navigator.open({
			ctrl : "login",
			titleid : "",			
			stack : true
		});
	
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
