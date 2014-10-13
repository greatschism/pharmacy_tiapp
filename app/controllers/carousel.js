var args = arguments[0] || {},
    App = require("core");

(function() {
	if (OS_IOS || OS_ANDROID) {
		$.carousel.animate(Ti.UI.createAnimation({
			opacity : 1,
			duration : 300
		}));
	}
})();

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
