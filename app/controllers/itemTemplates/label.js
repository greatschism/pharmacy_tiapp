var args = arguments[0] || {};

//reload tss of this controller in memory
require("config").updateTSS($.__controllerPath);

(function() {
	if (args.filterText) {
		$.row[Alloy.Globals.filterAttribute] = args.filterText;
	}
	if (args.lblClasses) {
		$.resetClass($.lbl, [args.lblClasses], {
			text : args.value || (args.data ? args.data[args.valueProperty] : "")
		});
	} else {
		$.lbl.text = args.value || (args.data ? args.data[args.valueProperty] : "");
	}
})();

function getParams() {
	return args;
}

exports.getParams = getParams;
