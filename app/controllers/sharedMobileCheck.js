var args = arguments[0] || {},
    app = require("core"),
    dialog = require("dialog"),
    uihelper = require("uihelper"),
    moment = require("alloy/moment");

function init() {
	uihelper.getImage($.logoImg);
}

function setParentViews(view) {
	$.dob.setParentView(view);
}

function moveToNext(e) {
	$.dob.showPicker();
}

function didClickNext() {
	var fname = $.fnameTxt.getValue(),
	    dob = $.dob.getValue();
	if (!fname) {
		dialog.show({
			message : Alloy.Globals.strings.valFirstNameRequired
		});
		return;
	}
	if (!dob) {
		dialog.show({
			message : Alloy.Globals.strings.valDOBRequired
		});
		return;
	}
	app.navigator.open({
		ctrl : "textToApp",
		stack : true,
		ctrlArguments : _.extend(args, {
			dob : dob
		})
	});
}

exports.init = init;
exports.setParentViews = setParentViews;
