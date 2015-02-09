var args = arguments[0] || {},
    utilities = require("utilities"),
    app = require("core");

function init() {
	utilities.setProperty(Alloy.CFG.FIRST_LAUNCH, false, "bool", false);
}

function didChangePage(e) {
	$.scrollableView.setCurrentPage(e.currentPage);
}

function didScrollend(e) {
	$.pagingControl.setCurrentPage(e.currentPage);
}

function didClickButtonBar(e) {
	var action = e.action;
	if (action == "login") {
		app.navigator.open({
			ctrl : "login",
			titleid : "strLogin",
			stack : true
		});
	} else {
		//sign up
		app.navigator.open({
			ctrl : "termsAndConditions",
			titleid : "titleTermsAndConditions",
			stack : true
		});
	}
}

exports.init = init;
