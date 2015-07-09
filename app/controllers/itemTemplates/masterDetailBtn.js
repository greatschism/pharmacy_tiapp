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
	if (args.detailType) {
		var btnDict = {
			title : args.detailTitle || (args.data ? args.data[args.detailTitleProperty] : "")
		};
		_.extend(btnDict, $.createStyle({
			classes : ["content-detail-" + args.detailType + "-" + "btn"],
		}));
		$.detailBtn.applyProperties(btnDict);
	} else {
		$.detailBtn.title = args.detailTitle || (args.data ? args.data[args.detailTitleProperty] : "");
	}
})();

function didClickDetail(e) {
	var source = e.source;
	$.trigger("clickdetail", {
		title : source.title,
		data : args
	});
}

function getParams() {
	return args;
}

exports.getParams = getParams;
