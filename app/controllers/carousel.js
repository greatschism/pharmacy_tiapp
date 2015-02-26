var args = arguments[0] || {},
    app = require("core"),
    uihelper = require("uihelper"),
    utilities = require("utilities");

function init() {
	utilities.setProperty(Alloy.CFG.FIRST_LAUNCH, false, "bool", false);
	uihelper.getImage($.logoImg);
	uihelper.getImage($.prescriptionListImg);
	uihelper.getImage($.helpfulMedicationImg);
	uihelper.getImage($.storeLocatorImg);
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

function didClickSkipToHome(e) {
	app.navigator.open({
		"titleid" : "titleHome",
		"ctrl" : "home"
	});
}

function didClickHaveAccount(e) {
	app.navigator.open({
		"titleid" : "strLogin",
		"ctrl" : "login"
	});
}

exports.init = init;
