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
	if (args.filterText) {
		$.row[Alloy.Globals.filterAttribute] = args.filterText;
	}
	$.row.height = CONSTS.height;
	if (args.masterWidth) {
		$.resetClass($.masterView, ["content-master-view-" + args.masterWidth]);
	}
	if (args.detailWidth) {
		$.resetClass($.detailView, ["content-detail-view-" + args.detailWidth]);
	}
	$.titleLbl.text = args.title;
	$.subtitleLbl.text = args.subtitle;
	var detailClassPrefix = "content-detail-" + (args.detailType ? args.detailType + "-" : "");
	$.addClass($.detailTitleLbl, [detailClassPrefix + "title"], {
		text : args.detailTitle
	});
	$.addClass($.detailSubtitleLbl, [detailClassPrefix + "subtitle"], {
		text : args.detailSubtitle
	});
})();

function getParams() {
	return args;
}

exports.getParams = getParams;
