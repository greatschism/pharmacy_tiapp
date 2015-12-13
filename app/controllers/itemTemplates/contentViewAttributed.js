var args = arguments[0] || {};

(function() {
	if (args.filterText) {
		$.row[Alloy.Globals.filterAttribute] = args.filterText;
	}
	var title = args.title || (args.data ? args.data[args.titleProperty] : "");
	if (args.titleClasses) {
		$.addClass($.titleLbl, args.titleClasses, {
			text : title
		});
	} else {
		$.titleLbl.text = title;
	}
	var subtitle = args.subtitle || (args.data ? args.data[args.subtitleProperty] : "");
	if (args.subtitleClasses) {
		$.addClass($.subtitleLbl, args.subtitleClasses, {
			text : subtitle
		});
	} else {
		$.subtitleLbl.text = subtitle;
	}
	var attributed = args.attributed || (args.data ? args.data[args.attributedProperty] : "");
	if (args.attributedClasses) {
		$.attributedAttr.applyProperties($.createStyle({
			classes : args.attributedClasses,
			html : attributed
		}));
	} else {
		$.attributedAttr.applyAttributes({
			secondaryfont : $.createStyle({
				classes : ["h5"]
			}).font,
			secondarycolor : $.createStyle({
				classes : ["active-fg-color"]
			}).color
		});
		$.attributedAttr.setHtml(attributed);
	}
})();

function didClick(e) {
	$.trigger("click", args);
}

function getParams() {
	return args;
}

exports.getParams = getParams;
