var args = arguments[0] || {};

//reload tss of this controller in memory
require("config").updateTSS($.__controllerPath);

(function() {
	if (args.filterText) {
		$.row[Alloy.Globals.filterAttribute] = args.filterText;
	}
	if (args.masterWidth) {
		$.resetClass($.masterView, ["content-master-view-" + args.masterWidth]);
	}
	if (args.detailWidth) {
		$.resetClass($.detailView, ["content-detail-view-" + args.detailWidth]);
	}
	$.titleLbl.text = args.title || (args.data ? args.data[args.titleProperty] : "");
	$.subtitleLbl.text = args.subtitle || (args.data ? args.data[args.subtitleProperty] : "");
	var detailClassPrefix = "content-detail-" + (args.detailType ? args.detailType + "-" : "");
	$.addClass($.detailTitleLbl, [detailClassPrefix + "title"], {
		text : args.detailTitle || (args.data ? args.data[args.detailTitleProperty] : "")
	});
	$.addClass($.detailSubtitleLbl, [detailClassPrefix + "subtitle"], {
		text : args.detailSubtitle || (args.data ? args.data[args.detailSubtitleProperty] : "")
	});
})();

function getParams() {
	return args;
}

exports.getParams = getParams;
