var args = arguments[0] || {},
    app = require("core");

function init() {
	Ti.App.Properties.setBool("firstLoad", false);
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
			titleid: "strLogin",
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
