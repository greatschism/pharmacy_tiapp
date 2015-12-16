var args = arguments[0] || {};

(function() {
	if (args.filterText) {
		$.row[Alloy.Globals.filterAttribute] = args.filterText;
	}
	$.addClass($.titleLbl, args.titleClasses || ["h4"], {
		text : args.title || (args.data ? args.data[args.titleProperty] : "")
	});
	$.addClass($.subtitleLbl, args.subtitleClasses || ["inactive-fg-color"], {
		text : args.subtitle || (args.data ? args.data[args.subtitleProperty] : "")
	});
	$.progressbar.width = args.progress + "%";
})();

function getParams() {
	return args;
}

exports.getParams = getParams;
