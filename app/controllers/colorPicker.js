var args = arguments[0] || {},
    color = args.color;

function init() {
	var hex = color.hex || Alloy.CFG.default_color;
	$.picker.color = hex;
	$.colorBoxView.applyProperties({
		backgroundColor : hex,
		borderColor : hex
	});
	$.colorLbl.right = $.colorBoxView.right + $.colorBoxView.width + $.createStyle({
		classes : ["margin-right-medium"]
	}).right;
}

function didChange(e) {
	var hex = e.hex;
	$.colorBoxView.applyProperties({
		backgroundColor : hex,
		borderColor : hex
	});
}

function didClickSubmit(e) {
	color.hex = $.picker.color.hex;
	$.app.navigator.close();
}

exports.init = init;
