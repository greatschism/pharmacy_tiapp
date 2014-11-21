var args = arguments[0] || {},
    app = require("core");

function setParentViews(view){
	$.dob.setParentView(view);
}

function moveToNext(e) {
	$.fnameTxt.blur();
	$.dob.showPicker();
}

function didClickNext(e) {
	app.navigator.open({
		ctrl : "signup",
		stack : true
	});
}

exports.setParentViews = setParentViews;