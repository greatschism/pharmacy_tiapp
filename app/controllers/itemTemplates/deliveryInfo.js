var args = $.args,
    uihelper = require("uihelper");

(function() {
	if (args.filterText) {
		$.row[Alloy.Globals.filterAttribute] = args.filterText;
	}
	/**
	 *  keep different class names for different layouts
	 */
	// $.row.className = "masterDetail" + (args.masterWidth || "") + (args.detailWidth || "") + "Btn";
	// if (args.masterWidth) {
	// $.resetClass($.masterView, ["left", "width-" + args.masterWidth, "auto-height", "vgroup"]);
	// }
	// if (args.detailWidth) {
	// $.resetClass($.detailView, ["right", "width-" + args.detailWidth, "auto-height", "vgroup"]);
	// }

	var title = args.address || (args.data ? args.data[args.titleProperty] : "");
	if (args.titleClasses) {
		$.resetClass($.deliverAddressReplyLbl, args.titleClasses, {
			text : title
		});
	} else {
		$.deliverAddressReplyLbl.text = title;
	}

	var subtitle = args.deliveryOption || (args.data ? args.data[args.subtitleProperty] : "");
	if (args.optionClasses) {
		$.resetClass($.deliverOptionReplyLbl, args.optionClasses, {
			text : subtitle
		});
	} else {
		$.deliverOptionReplyLbl.text = subtitle;
	}

	var tertiaryTitle = args.tertiaryTitle || (args.data ? args.data[args.ttProperty] : "");
	if (args.subtitleClasses) {
		$.resetClass($.deliverSubtotalReplyLbl, args.subtitleClasses, {
			text : tertiaryTitle
		});
	} else {
		$.deliverSubtotalReplyLbl.text = tertiaryTitle;
	}

	var detailTitle = args.detailTitle || (args.data ? args.data[args.detailTitle] : "");
	if (args.subtitleClasses) {
		$.resetClass($.deliveryCostReplyLbl, args.subtitleClasses, {
			text : detailTitle
		});
	} else {
		$.deliveryCostReplyLbl.text = detailTitle;
	}
	
	var detailSubtitle = args.detailSubtitle || (args.data ? args.data[args.detailSubtitle] : "");
	if (args.subtitleClasses) {
		$.resetClass($.orderTotalReplyLbl, args.subtitleClasses, {
			text : detailSubtitle
		});
	} else {
		$.orderTotalReplyLbl.text = detailSubtitle;
	}
	/*
	 var detailClassPrefix = args.detailType ? args.detailType + "-" : "";
	 $.addClass($.detailTitleLbl, [detailClassPrefix + "fg-color"], {
	 text : args.detailTitle || (args.data ? args.data[args.detailTitleProperty] : "")
	 });
	 $.addClass($.detailSubtitleLbl, [detailClassPrefix + "fg-color"], {
	 text : args.detailSubtitle || (args.data ? args.data[args.detailSubtitleProperty] : "")
	 });*/

	_.each(["deliverAddressReplyLbl", "deliverOptionReplyLbl"], function(val) {
		uihelper.wrapText($[val]);
	});

})();

function getParams() {
	return args;
}

function didClickChangeDelivery(e) {
	var source = e.source;
	$.trigger("clickDeliveryMethod", {
		source : $,
		titile : "",
		data : args
	});
}

function didClickEdit(e) {
	logger.debug("\n\n\n\n\npassing control to parent\n\n\n");
	var source = e.source;
	$.trigger("clickedit", {
		source : $,
		title : "",
		data : args
	});
}

function didClickPhone(e) {
	logger.debug("\n\n\n\n\n completed passing control to parent\n\n\n");
	var source = e.source;
	$.trigger("clickphone", {
		source : $,
		title : "",
		data : args
	});
}

exports.getParams = getParams;
