var args = $.args,
    uihelper = require("uihelper"),
    logger = require("logger");

(function() {

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
	if(subtitle === "") {
		$.subtitleLbl.height = 0;
	}
	/*
	var amountDue = args.amountDue || (args.data ? args.data[args.amountDue] : "");
	if (args.amountDue) {
		$.resetClass($.amountDueVal, args.amountDueClasses, {
			text : amountDue,
		});
	} else {
		$.amountDueVal.text = amountDue;
	}
	*/

	var amountDue = args.amountDue || (args.data ? args.data[args.amountDue] : "");
	if (args.amountDue) {

		$.amountDueVal.text = amountDue;
	} else {
		$.amountDueView.height = 0;
	}

	if(subtitle === "") {
		$.subtitleLbl.height = 0;
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

exports.getParams = getParams;
