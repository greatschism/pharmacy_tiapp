var args = arguments[0] || {};

//reload tss of this controller in memory
require("config").updateTSS($.__controllerPath);

(function() {
	if (args.filterText) {
		$.row[Alloy.Globals.filterAttribute] = args.filterText;
	}
	$.titleLbl.text = args.title || (args.data ? args.data[args.titleProperty] : "");
	$.subtitleLbl.text = args.subtitle || (args.data ? args.data[args.subtitleProperty] : "");
	if (args.tooltip) {
		$.row.className = "completedTooltip";
		$.tooltip = Alloy.createWidget("ti.tooltip", "widget", $.createStyle({
			classes : ["show", "right", "tooltip-left", "content-" + (args.tooltipType ? args.tooltipType + "-" : "") + "tooltip"]
		}));
		$.tooltipLbl = Alloy.createWidget("ti.styledlabel", "widget", $.createStyle({
			classes : ["tooltip-attributed-lbl-wrap"],
			text : args.tooltip
		}));
		$.tooltip.setContentView($.tooltipLbl.getView());
		$.contentView.add($.tooltip.getView());
	} else {
		$.row.className = "completed";
	}
})();

function getParams() {
	return args;
}

exports.getParams = getParams;
