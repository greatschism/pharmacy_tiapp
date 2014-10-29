var args = arguments[0] || {},
    app = require("core");

function moveToNext(e) {
	var nextItem = e.nextItem || "";
	$[nextItem] && $[nextItem].focus();
}

function didClickSave(e){
	
}
