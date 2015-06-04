var args = arguments[0] || {},
    app = require("core"),
    uihelper = require("uihelper"),
    utilities = require("utilities");

function init() {
	utilities.setProperty(Alloy.CFG.first_launch, false, "bool", false);
	uihelper.getImage("logo", $.logoImg);
	uihelper.getImage("prescription_list", $.prescriptionListImg);
	uihelper.getImage("helpful_medication", $.helpfulMedicationImg);
	uihelper.getImage("store_locator", $.storeLocatorImg);
}

function handleScroll(e) {
	$.helpfulMedicationScrollView.canCancelEvents = e.value;
}

function didChangePage(e) {
	$.scrollableView.setCurrentPage(e.currentPage);
}

function didScrollend(e) {
	$.pagingControl.setCurrentPage(e.currentPage);
}

function didClickSignin(e) {
	app.navigator.open({
		"titleid" : "strSignin",
		"ctrl" : "login"
	});
}

function didClickCreateAccount(e) {
	app.navigator.open({
		ctrl : "mobileNumber",
		titleid : "strWelcome",
		stack : true
	});
}

function didClickSkip(e) {
	app.navigator.open({
		"titleid" : "titleHome",
		"ctrl" : "home"
	});
}

exports.init = init;
