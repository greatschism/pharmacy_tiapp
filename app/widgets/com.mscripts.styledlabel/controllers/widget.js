var args = arguments[0] || {},
    _html,
    _font,
    _color,
    _textAlign;

(function() {

	_font = args.font || {
		fontFamily : "Arial",
		fontSize : 18
	};
	_color = args.color || "#000";
	_textAlign = args.textAlign || "center";

	var options = {};
	options = _.pick(args, ["width", "height", "top", "bottom", "left", "right", "backgroundColor", "borderColor", "borderWidth", "borderRadius"]);
	if (!_.isEmpty(options)) {
		if (OS_ANDROID) {
			_.extend(options, {
				font : _font,
				color : _color,
				textAlign : _textAlign
			});
		}
		$.widget.applyProperties(options);
	}

	if (_.has(args, "html")) {
		setHtml(args.html);
	}

})();

function setHtml(html) {
	_html = html;
	if (OS_ANDROID) {
		html = _html;
	} else {
		html = "<p style=\"font-family: " + _font.fontFamily + "; font-size: " + _font.fontSize + "; color: " + _color + "; text-align: " + _textAlign + ";\">" + _html + "</p>";
	}
	$.widget.html = html;
}

function getHtml() {
	return _html;
}

exports.setHtml = setHtml;
exports.getHtml = getHtml;
