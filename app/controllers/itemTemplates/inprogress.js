var args = arguments[0] || {},
    uihelper = require("uihelper");

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
	_.each(["titleLbl", "subtitleLbl"], function(val) {
		uihelper.wrapText($[val]);
	});
	$.progressBar.width = args.progress + "%";
})();

function getParams() {
	return args;
}

exports.getParams = getParams;
