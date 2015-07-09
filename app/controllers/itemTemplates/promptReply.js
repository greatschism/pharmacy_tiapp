var args = arguments[0] || {};

//reload tss of this controller in memory
require("config").updateTSS($.__controllerPath);

(function() {
	if (args.filterText) {
		$.row[Alloy.Globals.filterAttribute] = args.filterText;
	}
	$.promptLbl.text = args.prompt || (args.data ? args.data[args.promptProperty] : "");
	if (args.replyClasses) {
		$.resetClass($.replyLbl, [args.replyClasses], {
			text : args.reply || (args.data ? args.data[args.replyProperty] : "")
		});
	} else {
		$.replyLbl.text = args.reply || (args.data ? args.data[args.replyProperty] : "");
	}
})();

function getParams() {
	return args;
}

exports.getParams = getParams;
