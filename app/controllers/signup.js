var args = arguments[0] || {};

function didClickCreate(e) {

}

function didToggle(e) {
	$.passwordTxt.setPasswordMask(e.value);
}

function didFocusPassword(e) {
	$.passwordView.zIndex = 2;
	$.passwordTooltip.show();
}

function didBlurPassword(e) {
	$.passwordTooltip.hide(function(){
		$.passwordView.zIndex = 0;
	});
}

function moveToNext(e) {
	var nextItem = e.nextItem || "";
	nextItem ? $[nextItem] && $[nextItem].focus() : didClickCreate();
}

function handleScroll(e) {
	$.scrollView.canCancelEvents = e.value;
}
