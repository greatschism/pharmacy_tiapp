var args = arguments[0] || {},
    html,
    secondaryFont,
    secondaryColor;

(function() {

	var options = _.pick(args, ["width", "height", "top", "bottom", "left", "right", "font", "color", "textAlign", "backgroundColor", "borderColor", "borderWidth", "borderRadius", "accessibilityLabel", "accessibilityValue", "accessibilityHint", "accessibilityHidden"]);
	if (!_.isEmpty(options)) {
		$.widget.applyProperties(options);
	}

	secondaryFont = args.secondaryFont || {
		fontWeight : "bold",
		fontSize : 12
	};
	secondaryColor = args.secondaryColor || "#000";

	var value = args.html || args.text;
	if (value) {
		setHtml(value);
	}

})();

function setHtml(data) {
	html = data;
	var htmlparser = require(WPATH("htmlparser")).get(WPATH),
	    handler = new htmlparser.HtmlBuilder(function(error, dom) {
		if (error) {
			console.error("unable to parse html");
		} else {

			var text = "",
			    strings = [],
			    attributes = [],
			    len = dom.length,
			    i = 0,
			    j = 0;

			for ( i = 0; i < len; i++) {
				var item = dom[i];
				if (item.children) {
					var children = item.children;
					for (j in children) {
						children[j].previous = true;
						dom.splice(i + 1, 0, children[j]);
					}
					delete item.children;
					len = dom.length;
				} else if (item.data) {
					strings.push(item.data);
				}
			}

			j = 0;
			var lastIndex = len - 1;
			for ( i = 0; i < len; i++) {
				var item = dom[i];
				console.log(item.name);
				switch(item.name) {
				case "secondaryfont":
					attributes.push({
						type : Ti.UI.ATTRIBUTE_FONT,
						value : secondaryFont,
						range : [text.length, strings[j].length]
					});
					break;
				case "secondarycolor":
					attributes.push({
						type : Ti.UI.ATTRIBUTE_FOREGROUND_COLOR,
						value : secondaryColor,
						range : [text.length, strings[j].length]
					});
					break;
				case "u":
					attributes.push({
						type : Ti.UI.ATTRIBUTE_UNDERLINES_STYLE,
						value : Ti.UI.ATTRIBUTE_UNDERLINE_STYLE_SINGLE | Ti.UI.ATTRIBUTE_UNDERLINE_PATTERN_SOLID,
						range : [text.length, strings[j].length]
					});
					break;
				}
				if (item.data || (dom[i + 1] && !dom[i + 1].previous)) {
					text += strings[j];
					j += 1;
				}
			}

			$.widget.attributedString = Ti.UI.createAttributedString({
				text : strings.join(""),
				attributes : attributes
			});
		}
	});
	new htmlparser.Parser(handler).parseComplete(html);
}

function getHtml() {
	return html;
}

function didClick(e) {
	$.trigger("click", {
		source : $
	});
}

exports.setHtml = setHtml;
exports.getHtml = getHtml;
exports.setText = setHtml;
exports.getText = getHtml;

