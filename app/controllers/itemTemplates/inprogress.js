var args = arguments[0] || {};

//reload tss of this controller in memory
require("config").updateTSS($.__controllerPath);

(function() {
	if (args.filterText) {
		$.row[Alloy.Globals.filterAttribute] = args.filterText;
	}
	$.titleLbl.text = args.title;
	$.subtitleLbl.text = args.subtitle;
	$.progressbar.width = args.progress + "%";
})();

function getParams() {
	return args;
}

exports.getParams = getParams;
