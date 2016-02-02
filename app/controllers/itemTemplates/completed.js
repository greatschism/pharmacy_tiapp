var args = arguments[0] || {},
    uihelper = require("uihelper");

(function() {
	if (args.filterText) {
		$.row[Alloy.Globals.filterAttribute] = args.filterText;
	}
	var title = args.title || (args.data ? args.data[args.titleProperty] : "");
	if (args.titleClasses) {
		$.resetClass($.titleLbl, args.titleClasses, {
			text : title
		});
	} else {
		$.titleLbl.text = title;
	}
	var subtitle = args.subtitle || (args.data ? args.data[args.subtitleProperty] : "");
	if (args.subtitleClasses) {
		$.resetClass($.subtitleLbl, args.subtitleClasses, {
			text : subtitle
		});
	} else {
		$.subtitleLbl.text = subtitle;
	}
	uihelper.wrapViews($.masterView);
	_.each(["titleLbl", "subtitleLbl"], function(val) {
		uihelper.wrapText($[val]);
	});
	if (args.tooltip) {
		$.row.className = "completedTooltip";
		var tooltipType = args.tooltipType || "inactive";
		$.tooltip = Alloy.createWidget("ti.tooltip", "widget", $.createStyle({
			classes : ["show", "right", "width-50", "direction-left", tooltipType + "-bg-color", tooltipType + "-border"],
			arrowDict : $.createStyle({
				classes : [tooltipType + "-fg-color", "i5", "icon-filled-arrow-left"]
			}),
		}));
		$.tooltipLbl = Alloy.createWidget("ti.styledlabel", "widget", $.createStyle({
			classes : ["margin-top", "margin-bottom", "margin-left", "margin-right", "h6", "txt-center", "light-fg-color"],
			secondaryfont : $.createStyle({
				classes : ["h5"]
			}).font,
			secondarycolor : $.createStyle({
				classes : ["light-fg-color"]
			}).font,
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
