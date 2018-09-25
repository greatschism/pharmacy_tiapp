var args = $.args,
    uihelper = require("uihelper"),
    logger = require("logger");

(function() {
	if (args.filterText) {
		$.row[Alloy.Globals.filterAttribute] = args.filterText;
	}
	
	logger.debug("\n\n\n credit card view args		", JSON.stringify(args,null,4),"\n\n\n");

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

	if (args.amountDue) {
		if (args.amountDue >= 0) {
			$.amountDueVal.text = "$" + args.amountDue;
		}
	} else {
		$.dividerLbl.height = 0;
		$.amountDueView.height = 0;
		// $.cardInfoView.top = 0;

		$.cardInfoView.applyProperties($.createStyle({
			classes : ["top"]
		}));

	}

	if (args.showEditIcon) {
	} else {
		$.iconEditLbl.hide();
		$.iconEditLbl.height = 0;
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
