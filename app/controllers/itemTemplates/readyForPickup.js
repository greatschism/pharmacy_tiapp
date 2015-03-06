var args = arguments[0] || {};

(function() {
	$.titleLbl.text = args.presc_name;
	$.subtitleLbl.text = args.info;
	if (args.tooltip_style) {
		var tooltip = Alloy.createWidget("com.mscripts.tooltip", "widget", args.tooltip_style);
		tooltip.setContentView(Alloy.createWidget("com.mscripts.styledlabel", "widget", args.tooltip_lbl_style).getView());
		$.rowView.add(tooltip.getView());
	}
})(); 