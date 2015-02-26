var args = arguments[0] || {},
    app = require("core"),
    utilities = require("utilities");

function init() {
	utilities.setProperty(Alloy.CFG.FIRST_LAUNCH, false, "bool", false);
}

function didChangePage(e) {
	$.scrollableView.setCurrentPage(e.currentPage);
}

function didScrollend(e) {
	$.pagingControl.setCurrentPage(e.currentPage);
}

exports.init = init;
