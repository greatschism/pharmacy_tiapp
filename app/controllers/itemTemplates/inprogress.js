var args = arguments[0] || {};

(function() {
	if (args.filterText) {
		$.row[Alloy.Globals.filterAttribute] = args.filterText;
	}
	$.titleLbl.text = args.title || (args.data ? args.data[args.titleProperty] : "");
	$.subtitleLbl.text = args.subtitle || (args.data ? args.data[args.subtitleProperty] : "");
	$.progressbar.width = args.progress + "%";
})();

function getParams() {
	return args;
}

exports.getParams = getParams;
