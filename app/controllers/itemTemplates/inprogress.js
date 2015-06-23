var args = arguments[0] || {};

//reload tss of this controller in memory
require("config").updateTSS($.__controllerPath);

(function() {
	$.titleLbl.text = args.title;
	$.subtitleLbl.text = args.subtitle;
	if (args.progress < 100) {
		$.fillView.width = args.progress + "%";
	} else {
		$.contentView.remove($.progressbarView);
	}
})();

function getParams() {
	return args;
}

exports.getParams = getParams;
