var args = arguments[0] || {};

//reload tss of this controller in memory
require("config").updateTSS($.__controllerPath);

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
})();

function didClick(e) {
	$.trigger("click", args);
}

function getParams() {
	return args;
}

function getHeight() {
	return require("uihelper").getHeightFromChildren($.contentView, true);
}

exports.getParams = getParams;
exports.getHeight = getHeight;
