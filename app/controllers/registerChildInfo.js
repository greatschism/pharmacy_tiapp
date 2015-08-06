function focus(){
	$.uihelper.getImage("info", $.infoImg);
}
function didClickAccountExists(){
	$.app.navigator.open({
		titleid:"titleFamilyCare",
		ctrl : "childAccountTips",
		stack : true
	});
}
exports.focus=focus;