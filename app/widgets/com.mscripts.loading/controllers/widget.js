var args = arguments[0] || {};

(function() {

	var options = _.pick(args, ["title", "message", "cancelable", "location", "type"]);
	if (!_.isEmpty(options)) {
		$.widget.applyProperties(options);
	}

	if (args.visible !== false) {
		$.widget.show();
	}

})();

function setMessage(_message) {
	$.widget.setMessage(_message);
}

function show() {
	$.widget.show();
}

function hide() {
	$.widget.hide();
}

exports.show = show;
exports.hide = hide;
exports.setMessage = setMessage;
