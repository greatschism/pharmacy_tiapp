var args = arguments[0] || {};

(function() {
	if (args.filterText) {
		$.row[Alloy.Globals.filterAttribute] = args.filterText;
	}
	var pDict = $.createStyle({
		classes : args.promptClasses || ["content-group-prompt-40"],
		text : args.prompt || (args.data ? args.data[args.promptProperty] : "")
	}),
	    rDict = $.createStyle({
		classes : args.replyClasses || ["content-group-reply-60"],
		text : args.reply || (args.data ? args.data[args.replyProperty] : "")
	});
	$.row.className = "promptReply" + parseInt(pDict.width) + parseInt(rDict.height) + (args.hasChild && "WithChild" || "");
	$.promptLbl.applyProperties(pDict);
	$.replyLbl.applyProperties(rDict);
})();

function getParams() {
	return args;
}

exports.getParams = getParams;
