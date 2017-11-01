var args = $.args,
	checkedAccessiblity,
    uihelper = require("uihelper");

(function() {
	var rDict = {};
	if (_.isBoolean(args.selected)) {
		//to disable the selection
		rDict = $.createStyle({
			classes : ["row-selected-bg-color-disabled"]
		});
		if (OS_IOS) {
			$.addClass($.leftIconLbl, args.selected ? ["positive-fg-color", "icon-thin-filled-success","accessibility-disabled"] : ["inactive-fg-color", "icon-spot","accessibility-disabled"]);
			$.row.accessibilityValue = $.leftIconLbl.text == "+" ? Alloy.Globals.strings.accessibilityCheckboxRemoveSelection : Alloy.Globals.strings.accessibilityCheckboxSelect;			
		} else{
			$.addClass($.leftIconLbl, args.selected ? ["positive-fg-color", "icon-thin-filled-success","accessibility-enabled"] : ["inactive-fg-color", "icon-spot","accessibility-enabled"]);
			$.leftIconLbl.accessibilityLabel = args.selected ? Alloy.Globals.strings.accessibilityCheckboxRemoveSelection : Alloy.Globals.strings.accessibilityCheckboxSelect;
		};
		checkedAccessiblity = $.leftIconLbl.accessibilityLabel;
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
	var rowContainerObj = OS_IOS ? $.row : $.containerView;
	var rowAccessibilityText = $.titleLbl.text + " " + $.subtitleLbl.text;
	if (checkedAccessiblity) {
		rowAccessibilityText = rowAccessibilityText + " " + checkedAccessiblity;
		$.leftIconLbl.accessibilityHidden = true;
	} else {
		var lIconAccText = $.leftIconLbl.accessibilityLabel;
		if (lIconAccText) {			
			rowAccessibilityText = rowAccessibilityText + " " + lIconAccText;
			$.leftIconLbl.accessibilityHidden = true;
		};
	}
	rowContainerObj.accessibilityLabel = rowAccessibilityText;
	_.each(["titleLbl", "subtitleLbl"], function(val) {
		uihelper.wrapText($[val]);
	});
})();

function getParams() {
	return args;
}

function getHeight() {
	return uihelper.getHeightFromChildren($.contentView, true);
}

exports.getHeight = getHeight;
exports.getParams = getParams;
