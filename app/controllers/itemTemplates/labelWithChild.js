var args = arguments[0] || {};

//reload tss of this controller in memory
require("config").updateTSS($.__controllerPath);

(function() {
	if (args.filterText) {
		$.row[Alloy.Globals.filterAttribute] = args.filterText;
	}
	if (args.lblClasses) {
		$.resetClass($.lbl, args.lblClasses, {
			text : args.title || (args.data ? args.data[args.titleProperty] : "")
		});
	} else {
		$.lbl.text = args.title || (args.data ? args.data[args.titleProperty] : "");
	}
})();

function getParams() {
	return args;
}

exports.getParams = getParams;
