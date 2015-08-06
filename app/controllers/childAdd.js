function focus(){
	$.uihelper.getImage("child_add",$.childImg);
	$.vDividerView.height = $.uihelper.getHeightFromChildren($.txtView);
}
function moveToNext(e) {
	var nextItem = e.nextItem || false;
	if (nextItem && $[nextItem]) {
		$[nextItem].focus();
	}
}
function didClickContinue(){
	
}
function didClickSkip(){
	
}
exports.focus=focus;