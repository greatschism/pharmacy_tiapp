var args = $.args,
    html;

(function() {
	applyProperties(args);
})();

function applyProperties(dict) {
	var options = _.pick(dict, ["width", "height", "top", "bottom", "left", "right", "font", "color", "textAlign", "ellipsize", "wordWrap", "backgroundColor", "borderColor", "borderWidth", "borderRadius", "accessibilityLabel", "accessibilityValue", "accessibilityHint", "accessibilityHidden"]);
	if (!_.isEmpty(options)) {
		$.widget.applyProperties(options);
	}
	//TIMOB-14285
	if (_.has(dict, "id")) {
		$.widget.id = dict.id;
	}
	if (_.has(dict, "analyticsId")) {
		$.widget.analyticsId = dict.analyticsId;
	}
	//AC-201
	if (_.has(dict, "bubbleParent")) {
		$.widget.setBubbleParent(dict.bubbleParent);
	}
	var value = dict.html || dict.text;
	if (value) {
		setHtml(value);
	}
}

function applyAttributes(dict) {
	_.extend(args, dict);
}

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
				var item = dom[i],
				    name = item.name || "";
				if (name.indexOf("font") != -1) {
					if (args[name]) {
						attributes.push({
							type : Ti.UI.ATTRIBUTE_FONT,
							value : args[name],
							range : [text.length, strings[j].length]
						});
					}
				} else if (name.indexOf("color") != -1) {
					if (args[name]) {
						attributes.push({
							type : Ti.UI.ATTRIBUTE_FOREGROUND_COLOR,
							value : args[name],
							range : [text.length, strings[j].length]
						});
					}
				} else if (name === "u") {
					attributes.push({
						type : Ti.UI.ATTRIBUTE_UNDERLINES_STYLE,
						value : Ti.UI.ATTRIBUTE_UNDERLINE_STYLE_SINGLE | Ti.UI.ATTRIBUTE_UNDERLINE_PATTERN_SOLID,
						range : [text.length, strings[j].length]
					});
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

_.extend($, {
	setHtml : setHtml,
	getHtml : getHtml,
	setText : setHtml,
	getText : getHtml,
	applyAttributes : applyAttributes,
	applyProperties : applyProperties
});

