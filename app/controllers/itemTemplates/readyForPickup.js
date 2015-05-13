var args = arguments[0] || {};

(function() {
	$.titleLbl.text = args.presc_name;
	$.subtitleLbl.text = args.info;
	if (args.tooltip_style) {
		var tooltip = Alloy.createWidget("ti.tooltip", "widget", args.tooltip_style);
		tooltip.setContentView(Alloy.createWidget("ti.styledlabel", "widget", args.tooltip_lbl_style).getView());
		$.rowView.add(tooltip.getView());
	}
	$.row.rowId = args.id;
	$.row.sectionId = args.property;
	$.row.searchableText = (args.presc_name + args.rx_number_formated).toLowerCase();
})();
