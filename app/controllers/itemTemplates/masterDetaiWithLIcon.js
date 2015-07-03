var args = arguments[0] || {},
    uihelper = require("uihelper"),
    CONSTS = "CONST_" + $.__controllerPath;

//reload tss of this controller in memory
require("config").updateTSS($.__controllerPath);

if (!Alloy.TSS[CONSTS]) {
	Alloy.TSS[CONSTS] = {
		height : ($.contentView.top || 0) + ($.contentView.bottom || 0) + uihelper.getHeightFromChildren($.masterView, true),
	};
}

CONSTS = Alloy.TSS[CONSTS];

(function() {
	var detailClassPrefix = "content-detail-" + (args.detailType ? args.detailType + "-" : "");
	if (args.masterWidth) {
		$.resetClass($.masterView, ["content-master-view-" + args.masterWidth]);
	}
	if (args.detailWidth) {
		$.resetClass($.detailView, ["content-detail-view-" + args.detailWidth]);
	}
	if (args.filterText) {
		$.row[Alloy.Globals.filterAttribute] = args.filterText;
	}
	$.row.height = CONSTS.height;
	if (_.isBoolean(args.selected)) {
		$.addClass($.leftIconLbl, args.selected ? ["content-positive-left-icon", "icon-filled-success"] : ["content-inactive-left-icon", "icon-spot"]);
	} else {
		var classes = ["content-" + (args.iconType ? args.iconType + "-" : "") + "left-icon"];
		if (args.iconClass) {
			classes.push(args.iconClass);
		}
		var dict = $.createStyle({
			classes : classes
		});
		if (args.iconText) {
			dict.text = args.iconText;
		}
		if (args.iconAccessibilityLabel) {
			dict.accessibilityLabel = args.iconAccessibilityLabel;
		}
		$.leftIconLbl.applyProperties(dict);
	}
	$.titleLbl.text = args.title;
	$.subtitleLbl.text = args.subtitle;
	$.detailTitleLbl.applyProperties($.createStyle({
		classes : [detailClassPrefix + "title"],
		text : args.detailTitle
	}));
	$.detailSubtitleLbl.applyProperties($.createStyle({
		classes : [detailClassPrefix + "subtitle"],
		text : args.detailSubtitle
	}));
})();

function getParams() {
	return args;
}

exports.getParams = getParams;
