var args = arguments[0] || {};

//reload tss of this controller in memory
require("config").updateTSS($.__controllerPath);

(function() {
	$.titleLbl.text = args.title;
	$.subtitleLbl.text = args.subtitle;
	$.progressbarView.width = args.progress + "%";
})();

function getParams() {
	return args;
}

exports.getParams = getParams; 