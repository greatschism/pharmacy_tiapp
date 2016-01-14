var args = arguments[0] || {},
    uihelper = require("uihelper");

(function() {
	if (args.filterText) {
		$.row[Alloy.Globals.filterAttribute] = args.filterText;
	}
	if (args.hasChild) {
		$.contentView.right = $.childLbl.right + $.childLbl.font.fontSize + $.createStyle({
			classes : ["margin-right-small"]
		}).right;
	}
	var title = args.title || (args.data ? args.data[args.titleProperty] : "");
	if (args.lblClasses) {
		$.resetClass($.lbl, args.lblClasses, {
			text : title
		});
	} else {
		$.lbl.text = title;
	}
	uihelper.wrapText($.lbl);
})();

function getParams() {
	return args;
}

exports.getParams = getParams;
