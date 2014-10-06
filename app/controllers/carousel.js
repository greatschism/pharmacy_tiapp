var args = arguments[0] || {},
    App = require("core");

function didChangePage(e) {
	$.scrollableView.setCurrentPage(e.currentPage);
}

function didScrollend(e) {
	$.pagingControl.setCurrentPage(e.currentPage);
}

function didClickButtonBar(e) {
	var action = e.action;
	if (action == "login") {
		App.Navigator.open({
			ctrl : "login",
			stack : true
		});
	} else {
		//sign up
		App.Navigator.open({
			ctrl : "termsAndConditions",
			titleid : "termsAndConditions",
			stack : true
		});
	}
}
