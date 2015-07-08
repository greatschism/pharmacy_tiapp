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
	var rDict = {};
	if (_.isBoolean(args.selected)) {
		//to disable the selection b
		rDict = $.createStyle({
			classes : ["row-selection-disabled"]
		});
		$.addClass($.leftIconLbl, args.selected ? ["content-positive-left-icon", "icon-thin-filled-success"] : ["content-inactive-left-icon", "icon-spot"]);
	} else {
		/*
		 *  Note: Javascript objects passed by reference
		 *  creating new array for this icon class
		 *  to avoid same reference being used in another instance of this template
		 */
		var classes = [];
		if (args.iconType) {
			classes.push("content-" + args.iconType + "-left-icon");
		}
		if (args.iconClasses) {
			classes = _.union(classes, args.iconClasses)
		}
		var iDict = $.createStyle({
			classes : classes
		});
		if (args.iconText) {
			iDict.text = args.iconText;
		}
		if (args.iconAccessibilityLabel) {
			iDict.accessibilityLabel = args.iconAccessibilityLabel;
		}
		$.leftIconLbl.applyProperties(iDict);
	}
	if (args.filterText) {
		rDict[Alloy.Globals.filterAttribute] = args.filterText;
	}
	rDict.height = CONSTS.height;
	$.row.applyProperties(rDict);
	if (args.masterWidth) {
		$.resetClass($.masterView, ["content-master-view-" + args.masterWidth]);
	}
	if (args.detailWidth) {
		$.resetClass($.detailView, ["content-detail-view-" + args.detailWidth]);
	}
	$.titleLbl.text = args.title;
	$.subtitleLbl.text = args.subtitle;
	var detailClassPrefix = "content-detail-" + (args.detailType ? args.detailType + "-" : "");
	if (args.detailTitle) {
		$.addClass($.detailTitleLbl, [detailClassPrefix + "title"], {
			text : args.detailTitle
		});
	} else {
		$.detailTitleLbl.height = 0;
	}
	$.addClass($.detailSubtitleLbl, [detailClassPrefix + "subtitle"], {
		text : args.detailSubtitle
	});
})();

function getParams() {
	return args;
}

exports.getParams = getParams;
