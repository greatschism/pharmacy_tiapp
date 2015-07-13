var args = arguments[0] || {};

//reload tss of this controller in memory
require("config").updateTSS($.__controllerPath);

(function() {
	var rDict = {};
	if (_.isBoolean(args.selected)) {
		//to disable the selection b
		rDict = $.createStyle({
			classes : ["row-selection-disabled"]
		});
		$.addClass($.leftIconLbl, args.selected ? ["content-positive-left-icon", "icon-thin-filled-success"] : ["content-inactive-left-icon", "icon-spot"]);
	} else {
		var iDict = {};
		if (args.iconClasses) {
			iDict = $.createStyle({
				classes : args.iconClasses
			});
		}
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
	if (!_.isEmpty(rDict)) {
		$.row.applyProperties(rDict);
	}
	if (args.masterWidth) {
		$.resetClass($.masterView, ["content-master-view-" + args.masterWidth]);
	}
	if (args.detailWidth) {
		$.resetClass($.detailView, ["content-detail-view-" + args.detailWidth]);
	}
	$.titleLbl.text = args.title || (args.data ? args.data[args.titleProperty] : "");
	$.subtitleLbl.text = args.subtitle || (args.data ? args.data[args.subtitleProperty] : "");
	var detailClassPrefix = "content-detail-" + (args.detailType ? args.detailType + "-" : ""),
	    detailTitle = args.detailTitle || (args.data ? args.data[args.detailTitleProperty] : "");
	if (detailTitle) {
		$.addClass($.detailTitleLbl, [detailClassPrefix + "title"], {
			text : detailTitle
		});
	} else {
		$.detailTitleLbl.height = 0;
	}
	$.addClass($.detailSubtitleLbl, [detailClassPrefix + "subtitle"], {
		text : args.detailSubtitle || (args.data ? args.data[args.detailSubtitleProperty] : "")
	});
})();

function getParams() {
	return args;
}

function getHeight() {
	return ($.contentView.top || 0) + ($.contentView.bottom || 0) + require("uihelper").getHeightFromChildren($.masterView, true);
}

exports.getHeight = getHeight;
exports.getParams = getParams;
