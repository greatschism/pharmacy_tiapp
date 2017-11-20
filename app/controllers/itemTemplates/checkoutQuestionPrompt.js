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
	
})();

function getParams() {
	return args;
}

function didClickNo(e) {
	logger.debug("\n\n\n\n\npassing control to parent\n\n\n");
	var source = e.source;
	$.yesIcon.applyProperties($.createStyle({classes : ["inactive-fg-color"] }));
	$.yesLbl.applyProperties($.createStyle({classes : ["inactive-fg-color"] }));
	$.noIcon.applyProperties($.createStyle({classes : ["negative-fg-info-color"] }));
	$.noLbl.applyProperties($.createStyle({classes : ["negative-fg-info-color"] }));
	
		_.extend(args,{
			answer : "0"
		});
		$.trigger("answerPrompt", {
			source : $,
			title : source.title,
			data : args
		});
}

function didClickYes(e) {
	logger.debug("\n\n\n\n\npassing control to parent\n\n\n");
	var source = e.source;

	$.noIcon.applyProperties($.createStyle({classes : ["inactive-fg-color"] }));
	$.noLbl.applyProperties($.createStyle({classes : ["inactive-fg-color"] }));
	$.yesIcon.applyProperties($.createStyle({classes : ["positive-fg-color"] }));
	$.yesLbl.applyProperties($.createStyle({classes : ["positive-fg-color"] }));
	
		_.extend(args,{
			answer : "1"
		});
		$.trigger("answerPrompt", {
			source : $,
			title : source.title,
			data : args
		});
}



exports.getParams = getParams;
