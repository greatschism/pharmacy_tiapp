var args = arguments[0] || {},
    app = require("core"),

    
    moment = require('alloy/moment'),
    uihelper = require("uihelper");
    
    uihelper.getImage($.logoImage);


function setParentViews(view) {
	$.dob.setParentView(view);
}

function moveToNext(e) {
	$.fnameTxt.blur();
	$.dob.showPicker();
}

function didClickNext() {
	fname = $.fnameTxt.getValue(),
	dateOfBirth = $.dob.getValue();

	if (isNaN(fname) === true && dateOfBirth !== "") {
		//var pattern =/^(?:(0[1-9]|1[012])[\- \/.](0[1-9]|[12][0-9]|3[01])[\- \/.](19|20)[0-9]{2})$/ ;
		if (dateOfBirth === null || dateOfBirth === "") {
			alert("Invalid date of birth");
		} else {
			app.navigator.open({
				ctrl : "signup",
				titleid : "",
				stack : true,
				ctrlArguments : {
			   birthday:dateOfBirth,
				
			}
			});
		}
	} else {
		alert("Please enter a valid details.");
	}
}

exports.setParentViews = setParentViews;
