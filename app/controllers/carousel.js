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

function didClickLogin(e) {
	
	
		app.navigator.open({
			ctrl : "login",
			titleid : "strLogin",
			stack : true
		});
	} 
	function didClickCreateAccount(e) {
		app.navigator.open({
			ctrl : "termsAndConditions",
			titleid : "titleTermsAndConditions",
			stack : true
		});
	}


exports.init = init;
