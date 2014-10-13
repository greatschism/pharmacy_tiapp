var args = arguments[0] || {},
    App = require("core");

function init() {
	$.dob.setParentView($.sharedMobileCheck);
}

function moveToNext(e) {
	$.fnameTxt.blur();
	$.dob.showPicker();
}

function didClickNext(e) {
	App.Navigator.open({
		ctrl : "signup",
		stack : true
	});
}

exports.init = init;
