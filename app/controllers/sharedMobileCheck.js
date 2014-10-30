var args = arguments[0] || {},
    app = require("core");

function init() {
	$.dob.setParentView($.sharedMobileCheck);
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

exports.init = init;
