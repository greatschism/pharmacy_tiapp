var args = arguments[0] || {};

function didClick(e) {
	$.app.navigator.open({
		titleid : "titleRefill",
		ctrl : "refillPhone",
		ctrlArguments : {
			type : e.source.type
		},
		stack : true
	});
}