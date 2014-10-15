var args = arguments[0] || {};
App = require("core");

function moveToNext(e) {
	var nextItem = e.nextItem || "";
	$[nextItem] && $[nextItem].focus();
}

function handleScroll(e) {
	$.scrollView.canCancelEvents = e.value;
}

function chooseLocation(e) {

}
