var args = arguments[0] || {};

//reload tss of this controller in memory
require("config").updateTSS($.__controllerPath);

(function() {
	if (args.filterText) {
		$.row[Alloy.Globals.filterAttribute] = args.filterText;
	}
	if (args.lblClasses) {
		$.resetClass($.lbl, [args.lblClasses], {
			text : args.title || (args.data ? args.data[args.titleProperty] : "")
		});
	} else {
		$.lbl.text = args.title || (args.data ? args.data[args.titleProperty] : "");
	}
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
	if (!_.isEmpty(iDict)) {
		$.rightIconLbl.applyProperties(iDict);
	}
})();

function getParams() {
	return args;
}

exports.getParams = getParams;
