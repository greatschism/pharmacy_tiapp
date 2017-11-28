var args = $.args,
    uihelper = require("uihelper");

(function() {
	if (args.filterText) {
		$.row[Alloy.Globals.filterAttribute] = args.filterText;
	}
	var title = args.title || (args.data ? args.data[args.titleProperty] : ""),
	    right = $.colorBoxView.right + $.colorBoxView.width + $.createStyle({
		classes : ["margin-right-medium"]
	}).right;
	if (args.lblClasses) {
		$.resetClass($.lbl, args.lblClasses, {
			right : right,
			text : title
		});
	} else {
		$.lbl.applyProperties({
			right : right,
			text : title,
			accessibilityHidden: true
		});
	}
	uihelper.wrapText($.lbl);
	var color = args.color.color_code || "transparent";
	$.colorBoxView.applyProperties({
		backgroundColor : color,
		borderColor : color,
		accessibilityHidden: true
	});
	
	$.contentView.accessibilityLabel = Alloy.Globals.strings.accessibilityColorPicker + " " + args.color.color_name;
})();

function getParams() {
	return args.color;
}

exports.getParams = getParams;
