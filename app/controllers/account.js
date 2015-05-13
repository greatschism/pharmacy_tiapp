var args = arguments[0] || {},
    app = require("core"),
    config = require("config"),
    resources = require("resources"),
    utilities = require("utilities"),
    uihelper = require("uihelper"),
    colls = [{
	key : "themes",
	selectedItem : {}
}, {
	key : "templates",
	selectedItem : {}
}, {
	key : "languages",
	selectedItem : {}
}],
    lngStrs = Alloy.Globals.strings;

function init() {
	$.hideExpiredPrescriptionSwt.setValue(true);
	$.hideZeroRefillPrescriptionSwt.setValue(true);
	$.keepMeSignedInSwt.setValue(true);
	$.mobileNumberValue.text = "(606) 249 9965";

	if (!Ti.App.Properties.getString("emailID")) {
		$.emailValue.text = "test@gmail.com";
	} else {
		$.emailValue.text = Ti.App.Properties.getString("emailID");
	}
}

function didClickmobileNumber() {
}

function didClickEmailAddress() {
	app.navigator.open({
		ctrl : "changeEmailAddress",
		titleid : "titleChangeEmailAddress",
		stack : "true"
	});
}

exports.init = init;
