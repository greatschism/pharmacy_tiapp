var args = arguments[0] || {};

function didClickScan(e) {
	$.app.navigator.open({
		titleid : "titleRefill",
		ctrl : "refillPhone",
		stack : true
	});
}

function didClickType(e) {
	$.app.navigator.open({
		titleid : "titleRefillType",
		ctrl : "refillType",
		stack : true
	});
}