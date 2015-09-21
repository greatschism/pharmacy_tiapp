var args = arguments[0] || {},
    color = args.color;

function init() {
	var hex = color.hex || Alloy.CFG.default_color;
	$.picker.color = hex;
	$.colorView.backgroundColor = hex;
}

function didChange(e) {
	$.colorView.backgroundColor = e.hex;
}

function didClickSubmit(e) {
	color.hex = $.picker.color.hex;
	$.app.navigator.close();
}

exports.init = init;
