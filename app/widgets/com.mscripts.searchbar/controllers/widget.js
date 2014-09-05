var args = arguments[0] || {}, options;
options = _.pick(args, ["width", "height", "top", "bottom", "left", "right"]);
if (!_.isEmpty(options)) {
	$.widget.applyProperties(options);
}
options = _.pick(args, ["font", "color", "hintText", "value", "returnKeyType", "autocorrect", "autocapitalization"]);
if (!_.isEmpty(options)) {
	$.txt.applyProperties(options);
}
args = options = null;

function didFocus(e) {
	$.trigger("focus");
}

function didBlur(e) {
	$.trigger("blur");
}

function didChange(e) {
	$.cancelImg.visible = $.txt.getValue() != "";
}

function didTap(e) {
	$.txt.setValue("");
	$.cancelImg.visible = false;
}

exports.focus = function() {
	$.txt.focus();
};

exports.blur = function() {
	$.txt.blur();
};

exports.setValue = function(value) {
	$.txt.setValue(value);
};

exports.getValue = function() {
	return $.txt.getValue();
};
