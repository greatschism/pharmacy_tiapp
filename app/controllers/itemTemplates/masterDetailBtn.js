var args = $.args,
    uihelper = require("uihelper");

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
	var title = args.title || (args.data ? args.data[args.titleProperty] : "");
	if (args.titleClasses) {
		$.resetClass($.titleLbl, args.titleClasses, {
			text : title
		});
	} else {
		$.titleLbl.text = title;
	}
	var subtitle = args.subtitle || (args.data ? args.data[args.subtitleProperty] : "");
	if (args.subtitleClasses) {
		$.resetClass($.subtitleLbl, args.subtitleClasses, {
			text : subtitle
		});
	} else {
		$.subtitleLbl.text = subtitle;
	}
	var btnDict;
	if (args.detailWidth === 0) {
		btnDict = {
			width : 0,
			height : 0
		};
	} else {
		btnDict = {
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
	}
	$.detailBtn.applyProperties(btnDict);
	_.each(["titleLbl", "subtitleLbl"], function(val) {
		uihelper.wrapText($[val]);
	});
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
