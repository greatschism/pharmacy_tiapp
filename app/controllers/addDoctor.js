var args = arguments[0] || {},
    App = require("core");

function moveToNext(e) {
	var nextItem = e.nextItem || "";
	$[nextItem] && $[nextItem].focus();
}

function didClickSave(e){
	
}
