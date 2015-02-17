var args = arguments[0] || {},
    html,
    boldFont,
    boldColor;

(function() {

	var options;

	if (OS_IOS || OS_MOBILEWEB) {
		options = _.pick(args, ["width", "height", "top", "bottom", "left", "right", "font", "color", "textAlign", "backgroundColor", "borderColor", "borderWidth", "borderRadius"]);
		if (!_.isEmpty(options)) {
			$.lbl.applyProperties(options);
		}
	} else {
		options = _.pick(args, ["width", "height", "top", "bottom", "left", "right", "backgroundColor", "borderColor", "borderWidth", "borderRadius"]);
		if (!_.isEmpty(options)) {
			$.widget.applyProperties(options);
		}
		options = _.pick(args, ["font", "color", "textAlign"]);
		if (!_.isEmpty(options)) {
			$.lbl.applyProperties(options);
		}
	}

	if (OS_IOS) {
		boldFont = args.font || {
			fontFamily : "Lato",
			fontSize : 12
		};
		if (_.has(args, "boldFontFamily")) {
			_.extend(boldFont, {
				fontFamily : args.boldFontFamily
			});
		} else {
			_.extend(boldFont, {
				fontWeight : "bold"
			});
		}
	}
	boldColor = args.boldColor || "#000";

	if (_.has(args, "html")) {
		setHtml(args.html);
	}

})();

function setHtml(_html) {
	html = _html.replace(/boldFontFamily/g, boldFont.fontFamily).replace(/boldColor/g, boldColor);
	if (OS_IOS) {
		var htmlparser = require(WPATH("htmlparser")),
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
					switch(item.name) {
					case "b":
						attributes.push({
							type : Titanium.UI.iOS.ATTRIBUTE_FONT,
							value : boldFont,
							range : [text.length, strings[j].length]
						});
						break;
					case "font":
						if (item.attributes.face) {
							attributes.push({
								type : Titanium.UI.iOS.ATTRIBUTE_FONT,
								value : boldFont,
								range : [text.length, strings[j].length]
							});
						}
						if (item.attributes.color) {
							attributes.push({
								type : Titanium.UI.iOS.ATTRIBUTE_FOREGROUND_COLOR,
								value : item.attributes.color,
								range : [text.length, strings[j].length]
							});
						}
						break;
					case "u":
						attributes.push({
							type : Titanium.UI.iOS.ATTRIBUTE_UNDERLINES_STYLE,
							value : Titanium.UI.iOS.ATTRIBUTE_UNDERLINE_STYLE_SINGLE | Titanium.UI.iOS.ATTRIBUTE_UNDERLINE_PATTERN_SOLID,
							range : [text.length, strings[j].length]
						});
						break;
					}
					if (item.data || (dom[i + 1] && !dom[i + 1].previous)) {
						text += strings[j];
						j += 1;
					}
				}

				$.lbl.attributedString = Ti.UI.iOS.createAttributedString({
					text : strings.join(''),
					attributes : attributes
				});
			}
		});
		new htmlparser.Parser(handler).parseComplete(html);
	} else {
		$.lbl.html = html;
	}
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

