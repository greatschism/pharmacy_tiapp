var args = $.args,
    uihelper = require("uihelper"),
    logger = require("logger");

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
			text : subtitle,
		});
	} else {
		$.subtitleLbl.text = subtitle;
	}
	
	if (args.detailColor) {
			$.addClass($.detailLbl, [args.detailColor] );
	}
	
	if(args.amountDue >= 0)
	{
		$.amountDueVal.text = "$"+ args.amountDue;
	}
	
	uihelper.wrapViews($.masterView);
	_.each(["titleLbl", "subtitleLbl"], function(val) {
		uihelper.wrapText($[val]);
	});
})();

function getParams() {
	return args;
}

function didClickEditCard(e) {
	logger.debug("\n\n\n\n\npassing control to parent\n\n\n");
	var source = e.source;
	$.trigger("clickedit", {
		source : $,
		title : "",
		data : args
	});
}

exports.getParams = getParams;
