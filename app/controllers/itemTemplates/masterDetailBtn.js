var args = arguments[0] || {};

//reload tss of this controller in memory
require("config").updateTSS($.__controllerPath);

(function() {
	if (args.filterText) {
		$.row[Alloy.Globals.filterAttribute] = args.filterText;
	}
	/**
	 *  keep different class names for different layouts
	 */
	$.row.className = "masterDetail" + (args.masterWidth || "") + (args.detailWidth || "") + "Btn";
	if (args.masterWidth) {
		$.resetClass($.masterView, ["content-master-view-" + args.masterWidth]);
	}
	if (args.detailWidth) {
		$.resetClass($.detailView, ["content-detail-view-" + args.detailWidth]);
	}
	$.titleLbl.text = args.title || (args.data ? args.data[args.titleProperty] : "");
	$.subtitleLbl.text = args.subtitle || (args.data ? args.data[args.subtitleProperty] : "");
	var btnDict = {
		title : args.detailTitle || (args.data ? args.data[args.detailTitleProperty] : null)
	};
	if (args.btnClasses) {
		_.extend(btnDict, $.createStyle({
			classes : args.btnClasses
		}));
	}
	if (args.btnDict) {
		_.extend(btnDict, args.btnDict);
	}
	/**
	 * if only title is applied and no other styles are assigned
	 * assuming it should not be there in UI, so disable touch and visible
	 */
	if (_.keys(btnDict).length <= 1) {
		_.extend(btnDict, {
			touchEnabled : false,
			visible : false
		});
	}
	$.detailBtn.applyProperties(btnDict);
})();

function didClickDetail(e) {
	var source = e.source;
	$.trigger("clickdetail", {
		source : $,
		title : source.title,
		data : args
	});
}

function getParams() {
	return args;
}

exports.getParams = getParams;
