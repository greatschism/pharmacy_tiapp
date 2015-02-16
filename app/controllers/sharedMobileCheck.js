var args = arguments[0] || {},
    app = require("core"),
    
    moment = require('alloy/moment');
;

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
    
	if(isNaN(fname)==true&&dateOfBirth!=="" )
	{
	var pattern =/^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/ ;
    if (dateOfBirth == null || dateOfBirth == "" || !pattern.test(dateOfBirth))
    {
        alert("Invalid date of birth\n") ; 
        
    }
    else{
        
    


		app.navigator.open({
			ctrl : "signup",
			titleid : "",			
			stack : true
		});
}
}
else{
		alert("Please enter a valid details.");
	}
}

exports.setParentViews = setParentViews;
