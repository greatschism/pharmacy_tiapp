function focus(){
	$.uihelper.getImage("info", $.infoImg);
}
function didClickAccountExists(){
	$.app.navigator.open({
		ctrl : "childAccountTips",
		stack : true
	});
}
exports.focus=focus;