var args = arguments[0] || {};

//reload tss of this controller in memory
require("config").updateTSS($.__controllerPath);

(function() {
	var HEIGHT_CONST = "HEIGHT_" + $.__controllerPath,
	    detailClassPrefix = "content-detail-" + (args.detailType ? args.detailType + "-" : "");
	if (!Alloy.TSS[HEIGHT_CONST]) {
		Alloy.TSS[HEIGHT_CONST] = $.contentView.top + $.contentView.bottom + $.titleLbl.height + $.subtitleLbl.top + $.subtitleLbl.height
	}
	$.row.height = Alloy.TSS[HEIGHT_CONST];
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
