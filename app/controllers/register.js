function didClickMyself(){
	$.app.navigator.open({
		ctrl : "accountCreation",
		stack : true
	});
}
function didClickChild(){
	$.app.navigator.open({
		ctrl : "registerChildInfo",
		stack : true
	});
}
