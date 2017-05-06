var args = $.args,
    uihelper = require("uihelper");

(function() {
	var rDict = {};
	if (_.isBoolean(args.selected)) {
		//to disable the selection
		rDict = $.createStyle({
			classes : ["row-selected-bg-color-disabled"]
		});
		if( args.customIconNegative ) {
			$.addClass($.leftIconLbl, ["negative-fg-info-color", args.customIconNegative] );
		} else if( args.customIconYield ) {
			$.addClass($.leftIconLbl, ["yield-fg-info-color", args.customIconYield] );
		} else {
			$.addClass($.leftIconLbl, args.selected ? ["positive-fg-color", "icon-thin-filled-success"] : ["inactive-fg-color", "icon-spot"]);
		}
		$.leftIconLbl.accessibilityLabel = args.selected ? Alloy.Globals.strings.accessibilityCheckboxRemoveSelection : Alloy.Globals.strings.accessibilityCheckboxSelect;
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
	$.contentView.left = $.leftIconLbl.left + $.leftIconLbl.font.fontSize + $.createStyle({
		classes : ["margin-left-medium"]
	}).left;
	if (args.filterText) {
		rDict[Alloy.Globals.filterAttribute] = args.filterText;
	}
	/**
	 *  keep different class names for different layouts
	 */
	rDict.className = "masterDetail" + (args.masterWidth || "") + (args.detailWidth || "") + "withLIcon";
	$.row.applyProperties(rDict);
	if (args.masterWidth) {
		$.resetClass($.masterView, ["left", "width-" + args.masterWidth, "auto-height", "vgroup"]);
	}
	if (args.detailWidth) {
		$.resetClass($.detailView, ["right", "width-" + args.detailWidth, "auto-height", "vgroup"]);
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


	var detailClassPrefix = args.detailType ? args.detailType + "-" : "",
	    detailTitle = args.detailTitle || (args.data ? args.data[args.detailTitleProperty] : "");
	if (detailTitle) {
		$.addClass($.detailTitleLbl, [detailClassPrefix + "fg-color"], {
			text : detailTitle
		});
		uihelper.wrapText($.detailTitleLbl);
	} else {
		$.detailTitleLbl.height = 0;
	}
	$.addClass($.detailSubtitleLbl, [detailClassPrefix + "fg-color"], {
		text : args.detailSubtitle || (args.data ? args.data[args.detailSubtitleProperty] : "")
	});
	_.each(["titleLbl", "subtitleLbl", "detailSubtitleLbl"], function(val) {
		uihelper.wrapText($[val]);
	});
})();

function getParams() {
	return args;
}

function getHeight() {
	return ($.contentView.top || 0) + ($.contentView.bottom || 0) + uihelper.getHeightFromChildren($.masterView, true);
}

exports.getHeight = getHeight;
exports.getParams = getParams;
