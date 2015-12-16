var args = arguments[0] || {};

(function() {
	if (args.filterText) {
		$.row[Alloy.Globals.filterAttribute] = args.filterText;
	}
	/**
	 *  keep different class names for different layouts
	 */
	$.row.className = "masterDetail" + (args.masterWidth || "") + (args.detailWidth || "") + "Btn";
	if (args.masterWidth) {
		$.resetClass($.masterView, ["left", "width-" + args.masterWidth, "auto-height", "vgroup"]);
	}
	if (args.detailWidth) {
		$.resetClass($.detailView, ["right", "width-" + args.detailWidth, "auto-height", "vgroup"]);
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
