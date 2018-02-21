var args = $.args,
    uihelper = require("uihelper");

(function() {
	if (args.filterText) {
		$.row[Alloy.Globals.filterAttribute] = args.filterText;
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
	$.progressBar.width = args.progress + "%";
	var rowContainerObj = OS_IOS ? $.row : $.contentView;
 	var rowAccessibilityText = $.titleLbl.text + " " + $.subtitleLbl.text;
 	rowContainerObj.accessibilityLabel = rowAccessibilityText;
 	rowContainerObj.accessibilityValue = $.progressBar.width;
	_.each(["titleLbl", "subtitleLbl"], function(val) {
		uihelper.wrapText($[val]);
	});
	if (args.changeTimeLbl && Alloy.CFG.is_update_promise_time_enabled) {
	$.changeTimeLbl.text = args.changeTimeLbl;
	}
})();

function getParams() {
	return args;
}

function didClickPromiseTime(e) {
	var source = e.source;
	$.trigger("clickpromisetime", {
		source : $,
		title : "",
		data : args
	});
}

exports.getParams = getParams;
