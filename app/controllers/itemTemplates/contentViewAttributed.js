var args = $.args,
    uihelper = require("uihelper");

(function() {
	if (args.filterText) {
		$.row[Alloy.Globals.filterAttribute] = args.filterText;
	}
	var title = args.title || (args.data ? args.data[args.titleProperty] : "");
	if (args.titleClasses) {
		$.resetClass($.titleLbl, args.titleClasses, {
			text : title
		});
	} else {
		$.titleLbl.text = title;
	}
	var subtitle = args.subtitle || (args.data ? args.data[args.subtitleProperty] : "");
	if (args.subtitleClasses) {
		$.resetClass($.subtitleLbl, args.subtitleClasses, {
			text : subtitle
		});
	} else {
		$.subtitleLbl.text = subtitle;
	}
	_.each(["titleLbl", "subtitleLbl"], function(val) {
		uihelper.wrapText($[val]);
	});
	if (args.attributedClasses) {
		$.attributedAttr.applyProperties($.createStyle({
			classes : args.attributedClasses
		}));
	}
	if (args.attributes) {
		$.attributedAttr.applyAttributes(args.attributes);
	}
	$.attributedAttr.setHtml(args.attributed || (args.data ? args.data[args.attributedProperty] : ""));
	uihelper.wrapText($.attributedAttr.getView());
})();

function didClick(e) {
	$.trigger("click", args);
}

function getParams() {
	return args;
}

exports.getParams = getParams;
