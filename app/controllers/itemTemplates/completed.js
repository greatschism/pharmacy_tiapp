var args = arguments[0] || {};

//reload tss of this controller in memory
require("config").updateTSS($.__controllerPath);

(function() {
	$.titleLbl.text = args.title;
	$.subtitleLbl.text = args.subtitle;
	if (args.tooltip) {
		$.tooltip = Alloy.createWidget("ti.tooltip", "widget", $.createStyle({
			classes : ["show", "right", "tooltip-left", "content-" + (args.tooltipType ? args.tooltipType + "-" : "") + "tooltip"]
		}));
		$.tooltipLbl = Alloy.createWidget("ti.styledlabel", "widget", $.createStyle({
			classes : ["tooltip-attributed-lbl-wrap"],
			text : args.tooltip
		}));
		$.tooltip.setContentView($.tooltipLbl.getView());
		$.contentView.add($.tooltip.getView());
	}
})();

function getParams() {
	return args;
}

exports.getParams = getParams;
