var args = arguments[0] || {};

function didClick(e) {
	$.app.navigator.open({
		ctrl : "refillPhone",
		titleid : "titleQuickRefill",
		stack : true,
		ctrlArguments : {
			type : e.source.type
		}
	});
}