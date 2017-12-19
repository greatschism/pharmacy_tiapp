var args = $.args,
	rowIndex,
    uihelper = require("uihelper");

(function() {
	if (args.filterText) {
		$.row[Alloy.Globals.filterAttribute] = args.filterText;
	}
	if (typeof args.rowIndex !== undefined) {
		rowIndex = args.rowIndex;
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


	_.each(["titleLbl", "subtitleLbl"], function(val) {
		uihelper.wrapText($[val]);
	});
	$.row.accessibilityLabel = title + " " + subtitle;
})();

function didClickContainerView(e) {
	var source = e.source;
	$.trigger("clickedRowContainerView", {
		source : $,
		theRow : $.row,
		index : rowIndex,
	});
}

function getParams() {
	return args;
}

function getHeight() {
	return uihelper.getHeightFromChildren($.containerView, true);
}

exports.getParams = getParams;
exports.getHeight = getHeight;
