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
			text : subtitle.trim(),
		});
	} else {
		$.subtitleLbl.text = subtitle.trim();
	}
	if (subtitle === "") {
		$.subtitleLbl.height = 0;
	}

	var amountDue = args.amountDue || (args.data ? args.data[args.amountDue] : "");
	if (args.amountDue) {
		$.amountDueVal.text = "$" + amountDue.toFixed(2);
	} else {
		$.amountDueView.height = 0;
	}
})();

function getParams() {
	return args;
}

function didClickItem(e) {

	var source = e.source;
	$.trigger("checkoutStoreDetails", {
		source : $,
		title : source.title,
		data : args
	});
}

function didClickPhone(e) {
	var source = e.source;
	$.trigger("clickPhone", {
		source : $,
		titile : "",
		data : args
	});
}

exports.getParams = getParams;
