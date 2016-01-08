var args = arguments[0] || {};

(function() {
	var rDict = {};
	if (_.isBoolean(args.selected)) {
		//to disable the selection
		rDict = $.createStyle({
			classes : ["row-selected-color-disabled"]
		});
		$.addClass($.leftIconLbl, args.selected ? ["positive-fg-color", "icon-thin-filled-success"] : ["inactive-fg-color", "icon-spot"]);
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
	if (!_.isEmpty(rDict)) {
		$.row.applyProperties(rDict);
	}
	$.addClass($.titleLbl, args.titleClasses || ["h4"], {
		text : args.title || (args.data ? args.data[args.titleProperty] : "")
	});
	$.addClass($.subtitleLbl, args.subtitleClasses || ["inactive-fg-color"], {
		text : args.subtitle || (args.data ? args.data[args.subtitleProperty] : "")
	});
})();

function getParams() {
	return args;
}

function getHeight() {
	return require("uihelper").getHeightFromChildren($.contentView, true);
}

exports.getHeight = getHeight;
exports.getParams = getParams;
