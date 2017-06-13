var args = $.args,
    uihelper = require("uihelper");

(function() {
	if (args.filterText) {
		$.row[Alloy.Globals.filterAttribute] = args.filterText;
	}
	if (args.hasChild) {
		uihelper.wrapViews($.row, "right");
	}
	var title = args.title || (args.data ? args.data[args.titleProperty] : "");
	var accessibilityValue = args.accessibilityValue;
	if (args.lblClasses) {
		$.resetClass($.lbl, args.lblClasses, {
			text : title
		});
	} else {
		$.lbl.text = title;
	}
	if (accessibilityValue) {
		$.lbl.accessibilityLabel = title;
		$.lbl.accessibilityValue = accessibilityValue;
	};
	uihelper.wrapText($.lbl);
})();

function getParams() {
	return args;
}

exports.getParams = getParams;
