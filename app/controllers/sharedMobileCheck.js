var args = arguments[0] || {},
    app = require("core"),
    fname = $.fnameTxt.getValue(),
    dateOfBirth = $.dob.getValue(),
    moment = require('alloy/moment');
;

function setParentViews(view) {
	$.dob.setParentView(view);
}

function moveToNext(e) {
	$.fnameTxt.blur();
	$.dob.showPicker();
}

function didClickNext(e) {
	alert($.dob.getValue());
	if (fname != "") {

		validateFunction(dateOfBirth);

		// app.navigator.open({
		// titleid : "strSignup",
		// ctrl : "signup",
		// stack : true
		// });

	} else {
		alert("First name cannot be blank. Please check and enter the name again");
	}
}

function validateFunction(e) {

	var thisDate = e.value;
	var validatedValue = moment(thisDate).isValid();
	if (validatedValue == true) {
		// app.navigator.open({
		// titleid : "strSignup",
		// ctrl : "signup",
		// stack : true
		// });
	} else {
		alert("wrong date entered.");
	}
}

exports.setParentViews = setParentViews;
