var args = $.args,
    uihelper = require("uihelper");

(function() {
	if (args.filterText) {
		$.row[Alloy.Globals.filterAttribute] = args.filterText;
	}
	var swt = $.swt.getView(),
	    right = swt.right + swt.width + +$.createStyle({
		classes : ["margin-right-medium"]
	}).right,
	    title = args.title || (args.data ? args.data[args.titleProperty] : "");
	if (args.styledlabel) {
		$.attributedAttr.applyProperties(args.lblClasses ? $.createStyle({
			classes : args.lblClasses,
			right : right
		}) : {
			right : right
		});
		if (args.attributes) {
			$.attributedAttr.applyAttributes(args.attributes);
		}
		$.attributedAttr.setHtml(title);
		uihelper.wrapText($.attributedAttr.getView());
	} else {
		if (args.lblClasses) {
			$.resetClass($.lbl, args.lblClasses, {
				right : right,
				text : title
			});
		} else {
			$.lbl.applyProperties({
				right : right,
				text : title
			});
		}
		uihelper.wrapText($.lbl);
	}
	
	var iDict = {};
	iDict.accessibilityLabel = $.lbl.text;
	$.swt.applyProperties(iDict);
})();

function didChangeToggle(e) {
	$.trigger("change", {
		value : e.value
	});
}

function getParams() {
	return args;
}

exports.getParams = getParams;
exports.setValue = $.swt.setValue;
exports.getValue = $.swt.getValue;
